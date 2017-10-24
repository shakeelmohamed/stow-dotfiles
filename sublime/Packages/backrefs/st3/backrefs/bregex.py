r"""
Backrefs for the 'regex' module.

Add the ability to use the following backrefs with re:

    * \Q and \Q...\E - Escape/quote chars (search)
    * \c and \C...\E - Uppercase char or chars (replace)
    * \l and \L...\E - Lowercase char or chars (replace)

Compiling
=========
pattern = compile_search(r'somepattern', flags)
replace = compile_replace(pattern, r'\1 some replace pattern')

Usage
=========
Recommended to use compiling.  Assuming the above compiling:

    text = pattern.sub(replace, 'sometext')

--or--

    m = pattern.match('sometext')
    if m:
        text = replace(m)  # similar to m.expand(template)

Licensed under MIT
Copyright (c) 2015 - 2016 Isaac Muse <isaacmuse@gmail.com>
"""
from __future__ import unicode_literals
import sys
import re
import functools
from collections import namedtuple
from . import compat
from . import common_tokens as ctok
try:
    import regex
    REGEX_SUPPORT = True
except Exception:  # pragma: no coverage
    REGEX_SUPPORT = False

MAXUNICODE = sys.maxunicode
NARROW = sys.maxunicode == 0xFFFF

if REGEX_SUPPORT:
    # Expose some common re flags and methods to
    # save having to import re and backrefs libs
    D = regex.D
    DEBUG = regex.DEBUG
    A = regex.A
    ASCII = regex.ASCII
    B = regex.B
    BESTMATCH = regex.BESTMATCH
    E = regex.E
    ENHANCEMATCH = regex.ENHANCEMATCH
    F = regex.F
    FULLCASE = regex.FULLCASE
    I = regex.I
    IGNORECASE = regex.IGNORECASE
    L = regex.L
    LOCALE = regex.LOCALE
    M = regex.M
    MULTILINE = regex.MULTILINE
    R = regex.R
    REVERSE = regex.REVERSE
    S = regex.S
    DOTALL = regex.DOTALL
    U = regex.U
    UNICODE = regex.UNICODE
    X = regex.X
    VERBOSE = regex.VERBOSE
    V0 = regex.V0
    VERSION0 = regex.VERSION0
    V1 = regex.V1
    VERSION1 = regex.VERSION1
    W = regex.W
    WORD = regex.WORD
    P = regex.P
    POSIX = regex.POSIX
    DEFAULT_VERSION = regex.DEFAULT_VERSION
    REGEX_TYPE = type(regex.compile('', 0))
    escape = regex.escape
    purge = regex.purge

    # Replace flags
    FORMAT = 1

    # Case upper or lower
    _UPPER = 0
    _LOWER = 1

    utokens = {
        "regex_flags": re.compile(
            r'(?s)(\\.)|\(\?((?:[Laberuxp]|V0|V1|-?[imsfw])+)[):]|(.)'
        ),
        "replace_group_ref": re.compile(
            r'''(?x)
            (\\)|
            (
                [0-7]{3}|
                [1-9][0-9]?|
                [cClLEabfrtnv]|
                g<(?:[a-zA-Z]+[a-zA-Z\d_]*|0+|0*[1-9][0-9]?)>|
                U[0-9a-fA-F]{8}|
                u[0-9a-fA-F]{4}|
                x[0-9a-fA-F]{2}
            )
            '''
        ),
        "format_replace_ref": re.compile(
            r'''(?x)
            (\\)|
            (
                [cClLEabfrtnv]|
                U[0-9a-fA-F]{8}|
                u[0-9a-fA-F]{4}|
                x[0-9a-fA-F]{2}|
                [0-7]{1,3}|
                (
                    g<(?:[a-zA-Z]+[a-zA-Z\d_]*|0+|0*[1-9][0-9]?)>
                )
            )|
            (\{)'''
        ),
        "regex_search_ref": re.compile(r'(\\)|([(EQ])'),
        "regex_search_ref_verbose": re.compile(r'(\\)|([(EQ#])'),
        "v0": 'V0',
        "v1": 'V1'
    }

    btokens = {
        "regex_flags": re.compile(
            br'(?s)(\\.)|\(\?((?:[Laberuxp]|V0|V1|-?[imsfw])+)[):]|(.)'
        ),
        "replace_group_ref": re.compile(
            br'''(?x)
            (\\)|
            (
                [0-7]{3}|
                [1-9][0-9]?|
                [cClLEabfrtnv]|
                g<(?:[a-zA-Z]+[a-zA-Z\d_]*|0+|0*[1-9][0-9]?)>|
                x[0-9a-fA-F]{2}
            )
            '''
        ),
        "format_replace_ref": re.compile(
            br'''(?x)
            (\\)|
            (
                [cClLEabfrtnv]|
                x[0-9a-fA-F]{2}|
                [0-7]{1,3}|
                (
                    g<(?:[a-zA-Z]+[a-zA-Z\d_]*|0+|0*[1-9][0-9]?)>
                )
            )|
            (\{)'''
        ),
        "regex_search_ref": re.compile(br'(\\)|([EQ])'),
        "regex_search_ref_verbose": re.compile(br'(\\)|([EQ#])'),
        "v0": b'V0',
        "v1": b'V1'
    }

    class RegexSearchTokens(compat.Tokens):
        """Tokens."""

        def __init__(self, string, verbose):
            """Initialize."""

            if isinstance(string, compat.binary_type):
                tokens = btokens
                ctokens = ctok.btokens
            else:
                tokens = utokens
                ctokens = ctok.utokens

            self.string = string
            if verbose:
                self._regex_search_ref = tokens["regex_search_ref_verbose"]
            else:
                self._regex_search_ref = tokens["regex_search_ref"]
            self._b_slash = ctokens["b_slash"]
            self.max_index = len(string) - 1
            self.index = 0
            self.current = None

        def __iter__(self):
            """Iterate."""

            return self

        def iternext(self):
            """
            Iterate through characters of the string.

            Count escaped Q, E and backslash as a single char.
            """

            if self.index > self.max_index:
                raise StopIteration

            char = self.string[self.index:self.index + 1]
            if char == self._b_slash:
                m = self._regex_search_ref.match(self.string[self.index + 1:])
                if m:
                    char += m.group(1) if m.group(1) else m.group(2)

            self.index += len(char)
            self.current = char
            return self.current

    # Break apart template patterns into char tokens
    class ReplaceTokens(compat.Tokens):
        """Preprocess replace tokens."""

        def __init__(self, string, use_format=False):
            """Initialize."""

            if isinstance(string, compat.binary_type):
                ctokens = ctok.btokens
                tokens = btokens
            else:
                ctokens = ctok.utokens
                tokens = utokens

            self.string = string
            self.use_format = use_format
            if use_format:
                self._replace_ref = tokens["format_replace_ref"]
            else:
                self._replace_ref = tokens["replace_group_ref"]
            self._format_replace_group = ctokens["format_replace_group"]
            self._lc_bracket = ctokens["lc_bracket"]
            self._rc_bracket = ctokens["rc_bracket"]
            self._b_slash = ctokens["b_slash"]
            self.max_index = len(string) - 1
            self.index = 0
            self.current = None

        def __iter__(self):
            """Iterate."""

            return self

        def iternext(self):
            """
            Iterate through characters of the string.

            Count escaped l, L, c, C, E and backslash as a single char.
            """

            if self.index > self.max_index:
                raise StopIteration

            char = self.string[self.index:self.index + 1]
            if char == self._b_slash:
                m = self._replace_ref.match(self.string[self.index + 1:])
                if m:
                    if self.use_format and (m.group(3) or m.group(4)):
                        char += self._b_slash
                        self.index -= 1
                    if not self.use_format or not m.group(4):
                        char += m.group(1) if m.group(1) else m.group(2)
            elif self.use_format and char in (self._lc_bracket, self._rc_bracket):
                m = self._format_replace_group.match(self.string[self.index:])
                if m:
                    if m.group(2):
                        char = m.group(2)
                    else:
                        self.index += 1
                else:
                    raise ValueError("Single unmatched curly bracket!")

            self.index += len(char)
            self.current = char
            return self.current

    class RegexSearchTemplate(object):
        """Search Template."""

        def __init__(self, search, re_verbose=False, re_version=0):
            """Initialize."""

            if isinstance(search, compat.binary_type):
                self.binary = True
                tokens = btokens
                ctokens = ctok.btokens
            else:
                self.binary = False
                tokens = utokens
                ctokens = ctok.utokens

            self._verbose_flag = ctokens["verbose_flag"]
            self._empty = ctokens["empty"]
            self._b_slash = ctokens["b_slash"]
            self._ls_bracket = ctokens["ls_bracket"]
            self._rs_bracket = ctokens["rs_bracket"]
            self._esc_end = ctokens["esc_end"]
            self._end = ctokens["end"]
            self._quote = ctokens["quote"]
            self._negate = ctokens["negate"]
            self._regex_flags = tokens["regex_flags"]
            self._nl = ctokens["nl"]
            self._hashtag = ctokens["hashtag"]
            self._V0 = tokens["v0"]
            self._V1 = tokens["v1"]
            self.search = search
            if regex.DEFAULT_VERSION == V0:
                self.groups, quotes = self.find_char_groups_v0(search)
            else:  # pragma: no cover
                self.groups, quotes = self.find_char_groups_v1(search)
            self.verbose, self.version = self.find_flags(search, quotes, re_verbose, re_version)
            if self.version != regex.DEFAULT_VERSION:
                if self.version == V0:  # pragma: no cover
                    self.groups = self.find_char_groups_v0(search)[0]
                else:
                    self.groups = self.find_char_groups_v1(search)[0]
            if self.verbose:
                self._verbose_tokens = ctokens["verbose_tokens"]
            else:
                self._verbose_tokens = tuple()
            self.extended = []

        def find_flags(self, s, quotes, re_verbose, re_version):
            """Find verbose and unicode flags."""

            new = []
            start = 0
            verbose_flag = re_verbose
            version_flag = re_version
            avoid = quotes + self.groups
            avoid.sort()
            if version_flag and verbose_flag:
                return bool(verbose_flag), version_flag
            for a in avoid:
                new.append(s[start:a[0] + 1])
                start = a[1]
            new.append(s[start:])
            for m in self._regex_flags.finditer(self._empty.join(new)):
                if m.group(2):
                    if self._verbose_flag in m.group(2):
                        verbose_flag = True
                    if self._V0 in m.group(2):
                        version_flag = V0
                    elif self._V1 in m.group(2):
                        version_flag = V1
                if version_flag and verbose_flag:
                    break
            return bool(verbose_flag), version_flag if version_flag else regex.DEFAULT_VERSION

        def find_char_groups_v0(self, s):
            """Find character groups."""

            pos = 0
            groups = []
            quotes = []
            quote_found = False
            quote_start = 0
            escaped = False
            found = False
            first = None
            for c in compat.iterstring(s):
                if c == self._b_slash:
                    escaped = not escaped
                elif escaped and not found and not quote_found and c == self._quote:
                    quote_found = True
                    quote_start = pos - 1
                    escaped = False
                elif escaped and not found and quote_found and c == self._end:
                    quotes.append((quote_start + 2, pos - 2))
                    quote_found = False
                    escaped = False
                elif escaped:
                    escaped = False
                elif quote_found:
                    pass
                elif c == self._ls_bracket and not found:
                    found = True
                    first = pos
                elif c == self._negate and found and (pos == first + 1):
                    first = pos
                elif c == self._rs_bracket and found and (pos != first + 1):
                    groups.append((first + 1, pos - 1))
                    found = False
                pos += 1
            if quote_found:
                quotes.append((quote_start + 2, pos - 1))
            return groups, quotes

        def find_char_groups_v1(self, s):
            """Find character groups."""

            pos = 0
            groups = []
            quotes = []
            quote_found = False
            quote_start = 0
            escaped = False
            found = 0
            first = None
            sub_first = None
            for c in compat.iterstring(s):
                if c == self._b_slash:
                    # Next char is escaped
                    escaped = not escaped
                elif escaped and found == 0 and not quote_found and c == self._quote:
                    quote_found = True
                    quote_start = pos - 1
                    escaped = False
                elif escaped and found == 0 and quote_found and c == self._end:
                    quotes.append((quote_start, pos))
                    quote_found = False
                    escaped = False
                elif escaped:
                    # Escaped handled
                    escaped = False
                elif quote_found:
                    pass
                elif c == self._ls_bracket and not found:
                    # Start of first char set found
                    found += 1
                    first = pos
                elif c == self._ls_bracket and found:
                    # Start of sub char set found
                    found += 1
                    sub_first = pos
                elif c == self._negate and found == 1 and (pos == first + 1):
                    # Found ^ at start of first char set; adjust 1st char pos
                    first = pos
                elif c == self._negate and found > 1 and (pos == sub_first + 1):
                    # Found ^ at start of sub char set; adjust 1st char sub pos
                    sub_first = pos
                elif c == self._rs_bracket and found == 1 and (pos != first + 1):
                    # First char set closed; log range
                    groups.append((first, pos))
                    found = 0
                elif c == self._rs_bracket and found > 1 and (pos != sub_first + 1):
                    # Sub char set closed; decrement depth counter
                    found -= 1
                pos += 1
            if quote_found:
                quotes.append((quote_start, pos - 1))
            return groups, quotes

        def comments(self, i):
            """Handle comments in verbose patterns."""

            parts = []
            try:
                t = next(i)
                while t != self._nl:
                    parts.append(t)
                    t = next(i)
                parts.append(self._nl)
            except StopIteration:
                pass
            return parts

        def quoted(self, i):
            r"""Handle quoted block."""

            quoted = []
            raw = []
            if not self.in_group(i.index - 1):
                try:
                    t = next(i)
                    while t != self._esc_end:
                        raw.append(t)
                        t = next(i)
                except StopIteration:
                    pass
                if len(raw):
                    quoted.extend([escape(self._empty.join(raw))])
            return quoted

        def in_group(self, index):
            """Check if last index was in a char group."""

            inside = False
            for g in self.groups:
                if g[0] <= index <= g[1]:
                    inside = True
                    break
            return inside

        def apply(self):
            """Apply search template."""

            i = RegexSearchTokens(self.search, self.verbose)
            iter(i)

            for t in i:
                if len(t) > 1:
                    # handle our stuff

                    c = t[1:]

                    if c[0:1] in self._verbose_tokens:
                        self.extended.append(t)
                    elif c == self._quote:
                        self.extended.extend(self.quoted(i))
                    elif c != self._end:
                        self.extended.append(t)
                elif self.verbose and t == self._hashtag and not self.in_group(i.index - 1):
                    self.extended.append(t)
                    self.extended.extend(self.comments(i))
                else:
                    self.extended.append(t)

            return self._empty.join(self.extended)

    class ReplaceTemplate(object):
        """Pre-replace template."""

        def __init__(self, pattern, template, use_format=False):
            """Initialize."""

            if isinstance(template, compat.binary_type):
                self.binary = True
                ctokens = ctok.btokens
            else:
                self.binary = False
                ctokens = ctok.utokens

            self.string_convert = compat.int2bytes if self.binary else compat.int2str
            self.use_format = use_format
            self._original = template
            self._esc_end = ctokens["esc_end"]
            self._end = ctokens["end"]
            self._lc = ctokens["lc"]
            self._ls_bracket = ctokens["ls_bracket"]
            self._lc_bracket = ctokens["lc_bracket"]
            self._lc_span = ctokens["lc_span"]
            self._uc = ctokens["uc"]
            self._uc_span = ctokens["uc_span"]
            self._group = ctokens["group"]
            self._empty = ctokens["empty"]
            self._group_start = ctokens["group_start"]
            self._group_end = ctokens["group_end"]
            self._binary = ctokens["binary"]
            self._octal = ctokens["octal"]
            self._hex = ctokens["hex"]
            self._minus = ctokens["minus"]
            self._zero = ctokens["zero"]
            self._unicode_narrow = ctokens["unicode_narrow"]
            self._unicode_wide = ctokens["unicode_wide"]
            self.end_found = False
            self.group_slots = []
            self.literal_slots = []
            self.result = []
            self.span_stack = []
            self.single_stack = []
            self.slot = 0
            self.manual = False
            self.auto = False
            self.auto_index = 0
            self.pattern_hash = hash(pattern)

            self.parse_template(pattern)

        def regex_parse_template(self, template, pattern):
            """
            Parse template for the regex module.

            Do NOT edit the literal list returned by
            _compile_replacement_helper as you will edit
            the original cached value.  Copy the values
            instead.
            """

            groups = []
            literals = []
            replacements = regex._compile_replacement_helper(pattern, template)
            count = 0
            for part in replacements:
                if isinstance(part, int):
                    literals.append(None)
                    groups.append((count, part))
                else:
                    literals.append(part)
                count += 1
            return groups, literals

        def parse_template(self, pattern):
            """Parse template."""

            i = ReplaceTokens(self._original, use_format=self.use_format)
            iter(i)
            self.result = [self._empty]

            for t in i:
                if len(t) > 1:
                    if self.use_format and t[0:1] == self._lc_bracket:
                        self.handle_format_group(t[1:-1].strip())
                    else:
                        c = t[1:]
                        if c[0:1].isdigit() and (self.use_format or len(c) == 3):
                            value = int(c, 8)
                            if value > 0xFF:
                                if self.binary:
                                    # Re fails on octal greater than 0o377 or 0xFF
                                    raise ValueError("octal escape value outside of range 0-0o377!")
                                self.result.append('\\u%04x' % value)
                            else:
                                self.result.append(self.string_convert('\\%03o' % value))
                        elif not self.use_format and (c[0:1].isdigit() or c[0:1] == self._group):
                            self.handle_group(t)
                        elif c == self._lc:
                            self.single_case(i, _LOWER)
                        elif c == self._lc_span:
                            self.span_case(i, _LOWER)
                        elif c == self._uc:
                            self.single_case(i, _UPPER)
                        elif c == self._uc_span:
                            self.span_case(i, _UPPER)
                        elif c == self._end:
                            # This is here just as a reminder that \E is ignored
                            pass
                        else:
                            self.result.append(t)
                else:
                    self.result.append(t)

            if len(self.result) > 1:
                self.literal_slots.append(self._empty.join(self.result))
                del self.result[:]
                self.result.append(self._empty)
                self.slot += 1

            self._template = self._empty.join(self.literal_slots)
            self.groups, self.literals = self.regex_parse_template(self._template, pattern)

        def span_case(self, i, case):
            """Uppercase or lowercase the next range of characters until end marker is found."""

            attr = "lower" if case == _LOWER else "upper"
            self.span_stack.append(attr)
            try:
                t = next(i)
                while t != self._esc_end:
                    if len(t) > 1:
                        if self.use_format and t[0:1] == self._lc_bracket:
                            self.handle_format_group(t[1:-1].strip())
                        else:
                            c = t[1:]
                            first = c[0:1]
                            if first.isdigit() and (self.use_format or len(c) == 3):
                                value = int(c, 8)
                                if self.binary:
                                    if value > 0xFF:
                                        # Re fails on octal greater than 0o377 or 0xFF
                                        raise ValueError("octal escape value outside of range 0-0o377!")
                                    text = getattr(compat.uchr(value), attr)()
                                    single = self.get_single_stack()
                                    value = ord(getattr(text, single)()) if single is not None else ord(text)
                                    self.result.append(self.string_convert('\\%03o' % value))
                                else:
                                    text = getattr(compat.uchr(value), attr)()
                                    single = self.get_single_stack()
                                    value = ord(getattr(text, single)()) if single is not None else ord(text)
                                    self.result.append(('\\%03o' if value <= 0xFF else '\\u%04x') % value)
                            elif not self.use_format and (c[0:1].isdigit() or c[0:1] == self._group):
                                self.handle_group(t)
                            elif c == self._uc:
                                self.single_case(i, _UPPER)
                            elif c == self._lc:
                                self.single_case(i, _LOWER)
                            elif c == self._uc_span:
                                self.span_case(i, _UPPER)
                            elif c == self._lc_span:
                                self.span_case(i, _LOWER)
                            elif (
                                not self.binary and
                                (first == self._unicode_narrow or (not NARROW and first == self._unicode_wide))
                            ):
                                uc = compat.uchr(int(t[2:], 16))
                                text = getattr(uc, attr)()
                                single = self.get_single_stack()
                                value = ord(getattr(text, single)()) if single is not None else ord(text)
                                self.result.append(("\\u%04x" if value <= 0xFFFF else "\\U%08x") % value)
                            elif first == self._hex:
                                hc = chr(int(t[2:], 16))
                                text = getattr(hc, attr)()
                                single = self.get_single_stack()
                                value = ord(getattr(text, single)()) if single is not None else ord(text)
                                self.result.append(self.string_convert("\\x%02x" % value))
                            else:
                                self.get_single_stack()
                                self.result.append(t)
                    elif self.single_stack:
                        single = self.get_single_stack()
                        text = getattr(t, attr)()
                        if single is not None:
                            self.result.append(getattr(text[0:1], single)() + text[1:])
                    else:
                        self.result.append(getattr(t, attr)())
                    if self.end_found:
                        self.end_found = False
                        break
                    t = next(i)
            except StopIteration:
                pass
            self.span_stack.pop()

        def single_case(self, i, case):
            """Uppercase or lowercase the next character."""

            attr = "lower" if case == _LOWER else "upper"
            self.single_stack.append(attr)
            try:
                t = next(i)
                if len(t) > 1:
                    if self.use_format and t[0:1] == self._lc_bracket:
                        self.handle_format_group(t[1:-1].strip())
                    else:
                        c = t[1:]
                        first = c[0:1]
                        if first.isdigit() and (self.use_format or len(c) == 3):
                            value = int(c, 8)
                            if self.binary:
                                if value > 0xFF:
                                    # Re fails on octal greater than 0o377 or 0xFF
                                    raise ValueError("octal escape value outside of range 0-0o377!")
                                value = ord(getattr(compat.uchr(value), self.get_single_stack())())
                                self.result.append(self.string_convert('\\%03o' % value))
                            else:
                                value = ord(getattr(compat.uchr(value), self.get_single_stack())())
                                self.result.append(('\\%03o' if value <= 0xFF else '\\u%04x') % value)
                        elif not self.use_format and (c[0:1].isdigit() or c[0:1] == self._group):
                                self.handle_group(t)
                        elif c == self._uc:
                            self.single_case(i, _UPPER)
                        elif c == self._lc:
                            self.single_case(i, _LOWER)
                        elif c == self._uc_span:
                            self.span_case(i, _UPPER)
                        elif c == self._lc_span:
                            self.span_case(i, _LOWER)
                        elif c == self._end:
                            self.end_found = True
                        elif (
                            not self.binary and
                            (first == self._unicode_narrow or (not NARROW and first == self._unicode_wide))
                        ):
                            uc = compat.uchr(int(t[2:], 16))
                            value = ord(getattr(uc, self.get_single_stack())())
                            self.result.append(("\\u%04x" if value <= 0xFFFF else "\\U%08x") % value)
                        elif first == self._hex:
                            hc = chr(int(t[2:], 16))
                            self.result.append(
                                self.string_convert("\\x%02x" % ord(getattr(hc, self.get_single_stack())()))
                            )
                        else:
                            self.get_single_stack()
                            self.result.append(t)
                else:
                    self.result.append(getattr(t, self.get_single_stack())())

            except StopIteration:
                pass

        def get_single_stack(self):
            """Get the correct single stack item to use."""

            single = None
            while self.single_stack:
                single = self.single_stack.pop()
            return single

        def handle_format_group(self, text):
            """Handle groups."""

            capture = -1
            base = 10
            try:
                index = text.index(self._ls_bracket)
                capture = text[index + 1:-1]
                text = text[:index]
                prefix = capture[1:3] if capture[0:1] == self._minus else capture[:2]
                if prefix[0:1] == self._zero:
                    char = prefix[-1:]
                    if char == self._binary:
                        base = 2
                    elif char == self._octal:
                        base = 8
                    elif char == self._hex:
                        base = 16
            except ValueError:
                pass

            if not isinstance(capture, int):
                try:
                    capture = int(capture, base)
                except ValueError:
                    raise ValueError("Capture index must be an integer!")

            # Handle auto or manual format
            if text == self._empty:
                if self.auto:
                    text = self.string_convert(self.auto_index)
                    self.auto_index += 1
                elif not self.manual and not self.auto:
                    self.auto = True
                    text = self.string_convert(self.auto_index)
                    self.auto_index += 1
                else:
                    raise ValueError("Cannot switch to auto format during manual format!")
            elif not self.manual and not self.auto:
                self.manual = True
            elif not self.manual:
                raise ValueError("Cannot switch to manual format during auto format!")

            if len(self.result) > 1:
                self.literal_slots.append(self._empty.join(self.result))
                self.literal_slots.extend([self._group_start, text, self._group_end])
                del self.result[:]
                self.result.append(self._empty)
                self.slot += 1
            else:
                self.literal_slots.extend([self._group_start, text, self._group_end])

            single = self.get_single_stack()

            self.group_slots.append(
                (
                    self.slot,
                    (
                        self.span_stack[-1] if self.span_stack else None,
                        single,
                        capture
                    )
                )
            )
            self.slot += 1

        def handle_group(self, text):
            """Handle groups."""

            if len(self.result) > 1:
                self.literal_slots.append(self._empty.join(self.result))
                self.literal_slots.append(text)
                del self.result[:]
                self.result.append(self._empty)
                self.slot += 1
            else:
                self.literal_slots.append(text)

            single = self.get_single_stack()

            self.group_slots.append(
                (
                    self.slot,
                    (
                        self.span_stack[-1] if self.span_stack else None,
                        single,
                        -1
                    )
                )
            )
            self.slot += 1

        def get_base_template(self):
            """Return the unmodified template before expansion."""

            return self._original

        def get_group_index(self, index):
            """Find and return the appropriate group index."""

            g_index = None
            for group in self.groups:
                if group[0] == index:
                    g_index = group[1]
                    break
            return g_index

        def get_group_attributes(self, index):
            """Find and return the appropriate group case."""

            g_case = (None, None, -1)
            for group in self.group_slots:
                if group[0] == index:
                    g_case = group[1]
                    break
            return g_case

    # Template expander
    class ReplaceTemplateExpander(object):
        """Backrefereces."""

        def __init__(self, match, template):
            """Initialize."""

            if template.binary:
                ctokens = ctok.btokens
            else:
                ctokens = ctok.utokens

            self.template = template
            self._esc_end = ctokens["esc_end"]
            self._end = ctokens["end"]
            self._lc = ctokens["lc"]
            self._lc_span = ctokens["lc_span"]
            self._uc = ctokens["uc"]
            self._uc_span = ctokens["uc_span"]
            self.index = -1
            self.end_found = False
            self.parent_span = []
            self.match = match

        def expand(self):
            """Using the template, expand the string."""

            sep = self.match.string[:0]
            text = []
            # Expand string
            for x in range(0, len(self.template.literals)):
                index = x
                l = self.template.literals[x]
                if l is None:
                    g_index = self.template.get_group_index(index)
                    span_case, single_case, capture = self.template.get_group_attributes(index)
                    try:
                        l = self.match.captures(g_index)[capture]
                    except IndexError:
                        raise IndexError("'%d' is out of range!" % capture)
                    if span_case is not None:
                        l = getattr(l, span_case)()
                    if single_case is not None:
                        l = getattr(l[0:1], single_case)() + l[1:]
                text.append(l)

            return sep.join(text)

    class Replace(namedtuple('Replace', ['func', 'use_format', 'pattern_hash'])):
        """Bregex compiled replace object."""

        def __call__(self, *args, **kwargs):
            """Call."""

            return self.func(*args, **kwargs)

    def _apply_replace_backrefs(m, repl=None, flags=0):
        """Expand with either the ReplaceTemplate or compile on the fly, or return None."""

        if m is None:
            raise ValueError("Match is None!")
        else:
            if isinstance(repl, Replace):
                return repl(m)
            elif isinstance(repl, ReplaceTemplate):
                return ReplaceTemplateExpander(m, repl).expand()
            elif isinstance(repl, (compat.string_type, compat.binary_type)):
                return ReplaceTemplateExpander(m, ReplaceTemplate(m.re, repl, bool(flags & FORMAT))).expand()

    def _is_replace(obj):
        """Check if object is a replace object."""

        return isinstance(obj, (ReplaceTemplate, Replace))

    def _apply_search_backrefs(pattern, flags=0):
        """Apply the search backrefs to the search pattern."""

        if isinstance(pattern, (compat.string_type, compat.binary_type)):
            re_verbose = VERBOSE & flags
            if flags & V0:
                re_version = V0
            elif flags & V1:
                re_version = V1
            else:
                re_version = 0
            pattern = RegexSearchTemplate(pattern, re_verbose, re_version).apply()
        elif isinstance(pattern, REGEX_TYPE):
            if flags:
                raise ValueError("Cannot process flags argument with a compiled pattern!")
        else:
            raise TypeError("Not a string or compiled pattern!")
        return pattern

    def compile_search(pattern, flags=0, **kwargs):
        """Compile with extended search references."""

        return regex.compile(_apply_search_backrefs(pattern, flags), flags, **kwargs)

    def compile_replace(pattern, repl, flags=0):
        """Construct a method that can be used as a replace method for sub, subn, etc."""

        call = None
        if pattern is not None and isinstance(pattern, REGEX_TYPE):
            if isinstance(repl, (compat.string_type, compat.binary_type)):
                repl = ReplaceTemplate(pattern, repl, bool(flags & FORMAT))
                call = Replace(
                    functools.partial(_apply_replace_backrefs, repl=repl), repl.use_format, repl.pattern_hash
                )
            elif isinstance(repl, Replace):
                if flags:
                    raise ValueError("Cannot process flags argument with a compiled pattern!")
                if repl.pattern_hash != hash(pattern):
                    raise ValueError("Pattern hash doesn't match hash in compiled replace!")
                call = repl
            elif isinstance(repl, ReplaceTemplate):
                if flags:
                    raise ValueError("Cannot process flags argument with a ReplaceTemplate!")
                call = Replace(
                    functools.partial(_apply_replace_backrefs, repl=repl), repl.use_format, repl.pattern_hash
                )
            else:
                raise TypeError("Not a valid type!")
        else:
            raise TypeError("Pattern must be a compiled regular expression!")
        return call

    # Convenience methods like re has, but slower due to overhead on each call.
    # It is recommended to use compile_search and compile_replace
    def expand(m, repl):
        """Expand the string using the replace pattern or function."""

        if isinstance(repl, (Replace, ReplaceTemplate)):
            if repl.use_format:
                raise ValueError("Replace should not be compiled as a format replace!")
        elif not isinstance(repl, (compat.string_type, compat.binary_type)):
            raise TypeError("Expected string, buffer, or compiled replace!")
        return _apply_replace_backrefs(m, repl)

    def expandf(m, format):  # noqa B002
        """Expand the string using the format replace pattern or function."""

        if isinstance(format, (Replace, ReplaceTemplate)):
            if not format.use_format:
                raise ValueError("Replace not compiled as a format replace")
        elif not isinstance(format, (compat.string_type, compat.binary_type)):
            raise TypeError("Expected string, buffer, or compiled replace!")
        return _apply_replace_backrefs(m, format, flags=FORMAT)

    def match(pattern, string, flags=0, pos=None, endpos=None, partial=False, concurrent=None, **kwargs):
        """Wrapper for match."""

        return regex.match(
            _apply_search_backrefs(pattern, flags), string,
            flags, pos, endpos, partial, concurrent, **kwargs
        )

    def fullmatch(pattern, string, flags=0, pos=None, endpos=None, partial=False, concurrent=None, **kwargs):
        """Wrapper for fullmatch."""

        return regex.fullmatch(
            _apply_search_backrefs(pattern, flags), string,
            flags, pos, endpos, partial, concurrent, **kwargs
        )

    def search(pattern, string, flags=0, pos=None, endpos=None, partial=False, concurrent=None, **kwargs):
        """Wrapper for search."""

        return regex.search(
            _apply_search_backrefs(pattern, flags), string,
            flags, pos, endpos, partial, concurrent, **kwargs
        )

    def sub(pattern, repl, string, count=0, flags=0, pos=None, endpos=None, concurrent=None, **kwargs):
        """Wrapper for sub."""

        is_replace = _is_replace(repl)
        is_string = isinstance(repl, (compat.string_type, compat.binary_type))
        if is_replace and repl.use_format:
            raise ValueError("Compiled replace cannot be a format object!")

        pattern = compile_search(pattern, flags)
        return regex.sub(
            pattern, (compile_replace(pattern, repl) if is_replace or is_string else repl), string,
            count, flags, pos, endpos, concurrent, **kwargs
        )

    def subf(pattern, format, string, count=0, flags=0, pos=None, endpos=None, concurrent=None, **kwargs):  # noqa B002
        """Wrapper for subf."""

        is_replace = _is_replace(format)
        is_string = isinstance(format, (compat.string_type, compat.binary_type))
        if is_replace and not format.use_format:
            raise ValueError("Compiled replace is not a format object!")

        pattern = compile_search(pattern, flags)
        rflags = FORMAT if is_string else 0
        return regex.sub(
            pattern, (compile_replace(pattern, format, flags=rflags) if is_replace or is_string else format), string,
            count, flags, pos, endpos, concurrent, **kwargs
        )

    def subn(pattern, repl, string, count=0, flags=0, pos=None, endpos=None, concurrent=None, **kwargs):
        """Wrapper for subn."""

        is_replace = _is_replace(repl)
        is_string = isinstance(repl, (compat.string_type, compat.binary_type))
        if is_replace and repl.use_format:
            raise ValueError("Compiled replace cannot be a format object!")

        pattern = compile_search(pattern, flags)
        return regex.subn(
            pattern, (compile_replace(pattern, repl) if is_replace or is_string else repl), string,
            count, flags, pos, endpos, concurrent, **kwargs
        )

    def subfn(pattern, format, string, count=0, flags=0, pos=None, endpos=None, concurrent=None, **kwargs):  # noqa B002
        """Wrapper for subfn."""

        is_replace = _is_replace(format)
        is_string = isinstance(format, (compat.string_type, compat.binary_type))
        if is_replace and not format.use_format:
            raise ValueError("Compiled replace is not a format object!")

        pattern = compile_search(pattern, flags)
        rflags = FORMAT if is_string else 0
        return regex.subn(
            pattern, (compile_replace(pattern, format, flags=rflags) if is_replace or is_string else format), string,
            count, flags, pos, endpos, concurrent, **kwargs
        )

    def split(pattern, string, maxsplit=0, flags=0, concurrent=None, **kwargs):
        """Wrapper for split."""

        return regex.split(
            _apply_search_backrefs(pattern, flags), string,
            maxsplit, flags, concurrent, **kwargs
        )

    def splititer(pattern, string, maxsplit=0, flags=0, concurrent=None, **kwargs):
        """Wrapper for splititer."""

        return regex.splititer(
            _apply_search_backrefs(pattern, flags), string,
            maxsplit, flags, concurrent, **kwargs
        )

    def findall(
        pattern, string, flags=0, pos=None, endpos=None, overlapped=False,
        concurrent=None, **kwargs
    ):
        """Wrapper for findall."""

        return regex.findall(
            _apply_search_backrefs(pattern, flags), string,
            flags, pos, endpos, overlapped, concurrent, **kwargs
        )

    def finditer(
        pattern, string, flags=0, pos=None, endpos=None, overlapped=False,
        partial=False, concurrent=None, **kwargs
    ):
        """Wrapper for finditer."""

        return regex.finditer(
            _apply_search_backrefs(pattern, flags), string,
            flags, pos, endpos, overlapped, partial, concurrent, **kwargs
        )
