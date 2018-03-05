"""
Backrefs Re parser.

Licensed under MIT
Copyright (c) 2011 - 2018 Isaac Muse <isaacmuse@gmail.com>
"""
from __future__ import unicode_literals
import re as _re
from . import util as _util
import sre_parse as _sre_parse
import unicodedata as _unicodedata
from . import uniprops as _uniprops

__all__ = ("ReplaceTemplate",)

_SCOPED_FLAG_SUPPORT = _util.PY36

_ASCII_LETTERS = frozenset(
    (
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
        'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
        'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
        'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    )
)
_OCTAL = frozenset(('0', '1', '2', '3', '4', '5', '6', '7'))
_HEX = frozenset(('a', 'b', 'c', 'd', 'e', 'f', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'))
_WORD = _ASCII_LETTERS | frozenset(('_',))
_STANDARD_ESCAPES = frozenset(('a', 'b', 'f', 'n', 'r', 't', 'v'))
_DIGIT = frozenset(('0', '1', '2', '3', '4', '5', '6', '7', '8', '9'))
_CURLY_BRACKETS = frozenset(('{', '}'))
_PROPERTY_STRIP = frozenset((' ', '-', '_'))
_PROPERTY = _WORD | _DIGIT | _PROPERTY_STRIP
if _util.PY3:
    _GLOBAL_FLAGS = frozenset(('a', 'u', 'L'))
else:
    _GLOBAL_FLAGS = frozenset(('u', 'L'))
_SCOPED_FLAGS = frozenset(('i', 'm', 's', 'u', 'x'))

# Case upper or lower
_UPPER = 1
_LOWER = 2


class LoopException(Exception):
    """Loop exception."""


class GlobalRetryException(Exception):
    """Global retry exception."""


class _SearchParser(object):
    """Search Template."""

    _new_refs = ("e", "l", "L", "c", "C", "p", "P", "N", "Q", "E", "m", "M")
    _re_escape = r"\x1b"
    _re_start_wb = r"\b(?=\w)"
    _re_end_wb = r"\b(?<=\w)"

    def __init__(self, search, re_verbose=False, re_unicode=None):
        """Initialize."""

        if isinstance(search, _util.binary_type):
            self.binary = True
        else:
            self.binary = False

        self.search = search
        self.re_verbose = re_verbose
        self.re_unicode = re_unicode

    def process_quotes(self, string):
        """Process quotes."""

        escaped = False
        in_quotes = False
        current = []
        quoted = []
        i = _util.StringIter(string)
        iter(i)
        for t in i:
            if not escaped and t == "\\":
                escaped = True
            elif escaped:
                escaped = False
                if t == "E":
                    if in_quotes:
                        current.append(_re.escape("".join(quoted)))
                        quoted = []
                        in_quotes = False
                elif t == "Q" and not in_quotes:
                    in_quotes = True
                elif in_quotes:
                    quoted.extend(["\\", t])
                else:
                    current.extend(["\\", t])
            elif in_quotes:
                quoted.extend(t)
            else:
                current.append(t)

        if in_quotes and escaped:
            quoted.append("\\")
        elif escaped:
            current.append("\\")

        if quoted:
            current.append(_re.escape("".join(quoted)))

        return "".join(current)

    def verbose_comment(self, t, i):
        """Handle verbose comments."""

        current = []
        escaped = False

        try:
            while t != "\n":
                if not escaped and t == "\\":
                    escaped = True
                    current.append(t)
                elif escaped:
                    escaped = False
                    if t in self._new_refs:
                        current.append("\\")
                    current.append(t)
                else:
                    current.append(t)
                t = next(i)
        except StopIteration:
            pass

        if t == "\n":
            current.append(t)
        return current

    def flags(self, text, scoped=False):
        """Analyze flags."""

        global_retry = False
        if _util.PY3 and ('a' in text or 'L' in text) and self.unicode:
            self.unicode = False
            if not _SCOPED_FLAG_SUPPORT or not scoped:
                self.temp_global_flag_swap["unicode"] = True
                global_retry = True
        elif 'u' in text and not self.unicode and not self.binary:
            self.unicode = True
            if not _SCOPED_FLAG_SUPPORT or not scoped:
                self.temp_global_flag_swap["unicode"] = True
                global_retry = True
        if _SCOPED_FLAG_SUPPORT and '-x' in text and self.verbose:
            self.verbose = False
        elif 'x' in text and not self.verbose:
            self.verbose = True
            if not _SCOPED_FLAG_SUPPORT or not scoped:
                self.temp_global_flag_swap["verbose"] = True
                global_retry = True
        if global_retry:
            raise GlobalRetryException('Global Retry')

    def get_unicode_property(self, i):
        """Get Unicode property."""

        index = i.index
        prop = []
        value = []
        try:
            c = next(i)
            if c.upper() in _ASCII_LETTERS:
                prop.append(c)
            elif c != '{':
                raise SyntaxError("Unicode property missing '{' at %d!" % (i.index - 1))
            else:
                c = next(i)
                if c == '^':
                    prop.append(c)
                    c = next(i)
                while c not in (':', '=', '}'):
                    if c not in _PROPERTY:
                        raise SyntaxError('Invalid Unicode property character at %d!' % (i.index - 1))
                    if c not in _PROPERTY_STRIP:
                        prop.append(c)
                    c = next(i)
                if c in (':', '='):
                    c = next(i)
                    while c != '}':
                        if c not in _PROPERTY:
                            raise SyntaxError('Invalid Unicode property character at %d!' % (i.index - 1))
                        if c not in _PROPERTY_STRIP:
                            value.append(c)
                        c = next(i)
                    if not value:
                        raise SyntaxError('Invalid Unicode property!')
        except StopIteration:
            raise SyntaxError("Missing or unmatched '{' at %d!" % index)

        return ''.join(prop).lower(), ''.join(value).lower()

    def get_named_property(self, i):
        """Get Unicode name."""

        index = i.index
        value = []
        try:
            if next(i) != '{':
                raise ValueError("Named Unicode missing '{' %d!" % (i.index - 1))
            c = next(i)
            while c != '}':
                if c not in _WORD and c != ' ':
                    raise ValueError('Invalid named Unicode character %d!' % (i.index - 1))
                value.append(c)
                c = next(i)
        except Exception:
            raise SyntaxError("Unmatched '{' at %d!" % index)

        return ''.join(value)

    def get_wide_unicode(self, i):
        """Get narrow Unicode."""

        value = []
        for x in range(3):
            c = next(i)
            if c == '0':
                value.append(c)
            else:  # pragma: no cover
                raise SyntaxError('Invalid wide Unicode character at %d!' % (i.index - 1))

        c = next(i)
        if c in ('0', '1'):
            value.append(c)
        else:  # pragma: no cover
            raise SyntaxError('Invalid wide Unicode character at %d!' % (i.index - 1))

        for x in range(4):
            c = next(i)
            if c.lower() in _HEX:
                value.append(c)
            else:  # pragma: no cover
                raise SyntaxError('Invalid wide Unicode character at %d!' % (i.index - 1))
        return ''.join(value)

    def get_narrow_unicode(self, i):
        """Get narrow Unicode."""

        value = []
        for x in range(4):
            c = next(i)
            if c.lower() in _HEX:
                value.append(c)
            else:  # pragma: no cover
                raise SyntaxError('Invalid Unicode character at %d!' % (i.index - 1))
        return ''.join(value)

    def get_unicode(self, i, wide=False):
        """Get Unicode character."""

        value = int(self.get_wide_unicode(i) if wide else self.get_narrow_unicode(i), 16)
        return ('\\%03o' % value) if value <= 0xFF else _util.uchr(value)

    def reference(self, t, i, in_group=False):
        """Handle references."""

        current = []

        if not in_group and t == "m":
            current.append(self._re_start_wb)
        elif not in_group and t == "M":
            current.append(self._re_end_wb)
        elif t == "e":
            current.append(self._re_escape)
        elif t == "l":
            current.extend(self.letter_case_props(_LOWER, in_group))
        elif t == "L":
            current.extend(self.letter_case_props(_LOWER, in_group, negate=True))
        elif t == "c":
            current.extend(self.letter_case_props(_UPPER, in_group))
        elif t == "C":
            current.extend(self.letter_case_props(_UPPER, in_group, negate=True))

        elif _util.PY2 and not self.binary and t == "U":
            current.append(self.get_unicode(i, True))
        elif _util.PY2 and not self.binary and t == "u":
            current.append(self.get_unicode(i))
        elif t == 'p':
            prop = self.get_unicode_property(i)
            current.extend(self.unicode_props(prop[0], prop[1], in_group=in_group))
            if in_group:
                self.found_property = True
        elif t == 'P':
            prop = self.get_unicode_property(i)
            current.extend(self.unicode_props(prop[0], prop[1], in_group=in_group, negate=True))
            if in_group:
                self.found_property = True
        elif t == "N":
            text = self.get_named_property(i)
            current.extend(self.unicode_name(text, in_group))
            if in_group:
                self.found_property = True
        else:
            current.extend(["\\", t])
        return current

    def get_comments(self, i):
        """Get comments."""

        index = i.index
        value = ['(']
        escaped = False
        try:
            c = next(i)
            if c != '?':
                i.rewind(1)
                return None
            value.append(c)
            c = next(i)
            if c != '#':
                i.rewind(2)
                return None
            value.append(c)
            c = next(i)
            while c != ')' or escaped is True:
                if escaped:
                    escaped = False
                elif c == '\\':
                    escaped = True
                value.append(c)
                c = next(i)
            value.append(c)
        except StopIteration:
            raise SyntaxError("Unmatched '(' at %d!" % (index - 1))

        return ''.join(value)

    def get_flags(self, i, scoped=False):
        """Get flags."""

        if scoped and not _SCOPED_FLAG_SUPPORT:
            return None

        index = i.index
        value = ['(']
        toggle = False
        end = ':' if scoped else ')'
        try:
            c = next(i)
            if c != '?':
                i.rewind(1)
                return None
            value.append(c)
            c = next(i)
            while c != end:
                if toggle:
                    if c not in _SCOPED_FLAGS:
                        raise ValueError('Bad scope')
                    toggle = False
                elif scoped and c == '-':
                    toggle = True
                elif not _util.PY37 and scoped and c in _GLOBAL_FLAGS:
                    raise ValueError("Bad flag")
                elif c not in _GLOBAL_FLAGS and c not in _SCOPED_FLAGS:
                    raise ValueError("Bad flag")
                value.append(c)
                c = next(i)
            value.append(c)
        except Exception:
            i.rewind(i.index - index)
            value = []

        return ''.join(value) if value else None

    def subgroup(self, t, i):
        """Handle parenthesis."""

        current = []

        # (?flags)
        flags = self.get_flags(i)
        if flags:
            self.flags(flags[2:-1])
            return [flags]

        # (?#comment)
        comments = self.get_comments(i)
        if comments:
            return [comments]

        verbose = self.verbose
        unicode_flag = self.unicode

        # (?flags:pattern)
        flags = self.get_flags(i, True)
        if flags:  # pragma: no cover
            t = flags
            self.flags(flags[2:-1], scoped=True)

        current = []
        try:
            while t != ')':
                if not current:
                    current.append(t)
                else:
                    current.extend(self.normal(t, i))

                t = next(i)
        except StopIteration:
            pass

        # Restore flags after group
        self.verbose = verbose
        self.unicode = unicode_flag

        if t == ")":
            current.append(t)
        return current

    def get_posix(self, i):
        """Get POSIX."""

        index = i.index
        value = []
        try:
            c = next(i)
            if c != ':':
                raise ValueError('Not a valid property!')
            else:
                c = next(i)
                if c == '^':
                    value.append(c)
                    c = next(i)
                while c != ':':
                    if c not in _PROPERTY:
                        raise ValueError('Not a valid property!')
                    if c not in _PROPERTY_STRIP:
                        value.append(c)
                    c = next(i)
                if next(i) != ']' or not value:
                    raise ValueError('Not a valid property!')
        except Exception:
            i.rewind(i.index - index)
            value = []
        return ''.join(value).lower() if value else None

    def char_groups(self, t, i):
        """Handle character groups."""

        current = []
        pos = i.index - 1
        found = False
        escaped = False
        first = None
        self.found_property = False

        try:
            while True:
                if not escaped and t == "\\":
                    escaped = True
                elif escaped:
                    escaped = False
                    current.extend(self.reference(t, i, True))
                elif t == "[" and not found:
                    found = True
                    first = pos
                    current.append(t)
                elif t == "[":
                    posix = self.get_posix(i)
                    if posix:
                        current.extend(self.posix_props(posix, in_group=True))
                        self.found_property = True
                        pos = i.index - 2
                    else:
                        current.append(t)
                elif t == "^" and found and (pos == first + 1):
                    first = pos
                    current.append(t)
                elif t == "]" and found and (pos != first + 1):
                    found = False
                    current.append(t)
                    break
                else:
                    current.append(t)
                pos += 1
                t = next(i)
        except StopIteration:
            pass

        if escaped:
            current.append(t)

        # Handle properties that return an empty string.
        # This will occur when a property's values exceed
        # either the Unicode char limit on a narrow system,
        # or the ASCII limit in a byte string pattern.
        if self.found_property:
            value = "".join(current)
            if value == '[]':
                # We specified some properities, but they are all
                # out of reach.  Therefore we can match nothing.
                current = ['[^%s]' % ('\x00-\xff' if self.binary else _uniprops.UNICODE_RANGE)]
            elif value == '[^]':
                current = ['[%s]' % ('\x00-\xff' if self.binary else _uniprops.UNICODE_RANGE)]
            else:
                current = [value]

        return current

    def normal(self, t, i):
        """Handle normal chars."""

        current = []

        if t == "\\":
            try:
                t = next(i)
                current.extend(self.reference(t, i))
            except StopIteration:
                current.append(t)
        elif t == "(":
            current.extend(self.subgroup(t, i))
        elif self.verbose and t == "#":
            current.extend(self.verbose_comment(t, i))
        elif t == "[":
            current.extend(self.char_groups(t, i))
        else:
            current.append(t)
        return current

    def posix_props(self, prop, in_group=False):
        """
        Insert POSIX properties.

        Posix style properties are not as forgiving
        as Unicode properties.  Case does matter,
        and whitespace and '-' and '_' will not be tolerated.
        """

        try:
            if self.binary or not self.unicode:
                pattern = _uniprops.get_posix_property(
                    prop, (_uniprops.POSIX_BINARY if self.binary else _uniprops.POSIX)
                )
            else:
                pattern = _uniprops.get_posix_property(prop, _uniprops.POSIX_UNICODE)
        except Exception:
            raise ValueError('Invalid POSIX property!')
        if not in_group and not pattern:  # pragma: no cover
            pattern = '^%s' % ('\x00-\xff' if self.binary else _uniprops.UNICODE_RANGE)

        return [pattern]

    def unicode_name(self, name, in_group=False):
        """Insert Unicode value by its name."""

        value = _util.uord(_unicodedata.lookup(name))
        if (self.binary and value > 0xFF):
            value = ""
        if not in_group and value == "":
            return '[^%s]' % ('\x00-\xff' if self.binary else _uniprops.UNICODE_RANGE)
        elif value == "":
            return value
        else:
            return ['\\%03o' % value if value <= 0xFF else _util.uchr(value)]

    def unicode_props(self, props, value, in_group=False, negate=False):
        """
        Insert Unicode properties.

        Unicode properties are very forgiving.
        Case doesn't matter and `[ -_]` will be stripped out.
        """

        # 'GC = Some_Unpredictable-Category Name' -> 'gc=someunpredictablecategoryname'
        category = None

        # \p{^negated} Strip off the caret after evaluation.
        if props.startswith("^"):
            negate = not negate
        if props.startswith("^"):
            props = props[1:]

        # Get the property and value.
        # If a property is present and not block,
        # we can assume GC as that is all we support.
        # If we are wrong it will fail.
        if value:
            if _uniprops.is_enum(props):
                category = props
                props = value
            elif value in ('y', 'yes', 't', 'true'):
                category = 'binary'
            elif value in ('n', 'no', 'f', 'false'):
                category = 'binary'
                negate = not negate
            else:
                raise ValueError('Invalid Unicode property!')

        v = _uniprops.get_unicode_property(("^" if negate else "") + props, category, self.binary)
        if not in_group:
            if not v:
                v = '^%s' % ('\x00-\xff' if self.binary else _uniprops.UNICODE_RANGE)
            v = "[%s]" % v
        properties = [v]

        return properties

    def letter_case_props(self, case, in_group, negate=False):
        """Insert letter (ASCII or Unicode) case properties."""

        # Use traditional ASCII upper/lower case unless:
        #    1. The strings fed in are not binary
        #    2. And the the unicode flag was used
        if not in_group:
            v = self.posix_props(("^" if negate else "") + ("upper" if case == _UPPER else "lower"), in_group=in_group)
            v[0] = "[%s]" % v[0]
        else:
            v = self.posix_props(("^" if negate else "") + ("upper" if case == _UPPER else "lower"), in_group=in_group)
        return v

    def main_group(self, i):
        """The main group: group 0."""

        current = []
        while True:
            try:
                t = next(i)
                current.extend(self.normal(t, i))
            except StopIteration:
                break
        return current

    def parse(self):
        """Apply search template."""

        self.verbose = bool(self.re_verbose)
        self.unicode = bool(self.re_unicode)
        self.global_flag_swap = {
            "unicode": ((self.re_unicode is not None) if not _util.PY37 else False),
            "verbose": False
        }
        self.temp_global_flag_swap = {
            "unicode": False,
            "verbose": False
        }
        if _util.PY3:
            self.ascii = self.re_unicode is not None and not self.re_unicode
        else:
            self.ascii = False
        if _util.PY3 and not self.unicode and not self.ascii:
            self.unicode = True

        new_pattern = []
        string = self.process_quotes(self.search.decode('latin-1') if self.binary else self.search)

        i = _util.StringIter(string)
        iter(i)

        retry = True
        while retry:
            retry = False
            try:
                new_pattern = self.main_group(i)
            except GlobalRetryException:
                # Prevent a loop of retry over and over for a pattern like ((?u)(?a))
                # or (?-x:(?x))
                if self.temp_global_flag_swap['unicode']:
                    if self.global_flag_swap['unicode']:
                        raise LoopException('Global unicode flag recursion.')
                    else:
                        self.global_flag_swap["unicode"] = True
                if self.temp_global_flag_swap['verbose']:
                    if self.global_flag_swap['verbose']:
                        raise LoopException('Global verbose flag recursion.')
                    else:
                        self.global_flag_swap['verbose'] = True
                self.temp_global_flag_swap = {
                    "unicode": False,
                    "verbose": False
                }
                i.rewind(i.index)
                retry = True

        return "".join(new_pattern).encode('latin-1') if self.binary else "".join(new_pattern)


class _ReplaceParser(object):
    """Pre-replace template."""

    def __init__(self):
        """Initialize."""

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

    def get_format(self, c, i):
        """Get format group."""

        index = i.index

        value = []
        try:
            if c == '}':
                value.append('')
            else:
                if c in _WORD:
                    # Handle name
                    value.append(c)
                    c = next(i)
                    while c not in ('}', '['):
                        if c not in _WORD and c not in _DIGIT:
                            raise SyntaxError('Invalid format character at %d!' % (i.index - 1))
                        value.append(c)
                        c = next(i)
                elif c in _DIGIT:
                    # Handle group number
                    value.append(c)
                    c = next(i)
                    while c not in ('}', '['):
                        if c not in _DIGIT:
                            raise SyntaxError('Invalid format character at %d' % (i.index - 1))
                        value.append(c)
                        c = next(i)
                if c == '[':
                    sindex = i.index - 1
                    value.append(c)
                    c = next(i)
                    while c not in (']', '}'):
                        value.append(c)
                        c = next(i)
                    if c != ']':
                        raise SyntaxError("Unmatched '[' at %d!" % (sindex - 1))
                    value.append(c)
                    c = next(i)
            if c != '}':
                raise SyntaxError("Unmatched '{' at %d!" % (index - 1))
        except StopIteration:
            raise SyntaxError("Unmatched '{' at %d!" % (index - 1))

        return ''.join(value)

    def handle_format(self, t, i):
        """Handle format."""

        if t == '{':
            t = next(i)
            if t == '{':
                self.get_single_stack()
                self.result.append(t)
            else:
                text = self.get_format(t, i)
                self.handle_format_group(text.strip())
        else:
            t = next(i)
            if t == '}':
                self.get_single_stack()
                self.result.append(t)
            else:
                raise SyntaxError("Unmatched '}' at %d!" % (i.index - 2))

    def get_octal(self, c, i):
        """Get octal."""

        index = i.index
        value = []
        zero_count = 0
        try:
            if c == '0':
                for x in range(3):
                    if c != '0':
                        break
                    value.append(c)
                    c = next(i)
            zero_count = len(value)
            if zero_count < 3:
                for x in range(3 - zero_count):
                    if c not in _OCTAL:
                        break
                    value.append(c)
                    c = next(i)
            i.rewind(1)
        except StopIteration:
            pass

        octal_count = len(value)
        if not (zero_count and octal_count < 3) and octal_count != 3:
            i.rewind(i.index - index)
            value = []

        return ''.join(value) if value else None

    def parse_octal(self, text):
        """Parse octal value."""

        value = int(text, 8)
        if value > 0xFF and self.binary:
            # Re fails on octal greater than 0o377 or 0xFF
            raise ValueError("octal escape value outside of range 0-0o377!")
        else:
            single = self.get_single_stack()
            if self.span_stack:
                text = self.convert_case(_util.uchr(value), self.span_stack[-1])
                value = _util.uord(self.convert_case(text, single)) if single is not None else _util.uord(text)
            elif single:
                value = _util.uord(self.convert_case(_util.uchr(value), single))
            if value <= 0xFF:
                self.result.append('\\%03o' % value)
            else:
                self.result.append(_util.uchr(value))

    def get_named_unicode(self, i):
        """Get named Unicode."""

        index = i.index
        value = []
        try:
            if next(i) != '{':
                raise SyntaxError("Named Unicode missing '{'' at %d!" % (i.index - 1))
            c = next(i)
            while c != '}':
                if c not in _WORD and c != ' ':
                    raise SyntaxError("Bad named Unicode character at %d!" % (index - 1))
                value.append(c)
                c = next(i)
        except StopIteration:
            raise SyntaxError("Unmatched '}' at %d!" % index)

        return ''.join(value)

    def parse_named_unicode(self, i):
        """Parse named Unicode."""

        value = _util.uord(_unicodedata.lookup(self.get_named_unicode(i)))
        single = self.get_single_stack()
        if self.span_stack:
            text = self.convert_case(_util.uchr(value), self.span_stack[-1])
            value = _util.uord(self.convert_case(text, single)) if single is not None else _util.uord(text)
        elif single:
            value = _util.uord(self.convert_case(_util.uchr(value), single))
        if value <= 0xFF:
            self.result.append('\\%03o' % value)
        else:
            self.result.append(_util.uchr(value))

    def get_wide_unicode(self, i):
        """Get narrow Unicode."""

        value = []
        for x in range(3):
            c = next(i)
            if c == '0':
                value.append(c)
            else:  # pragma: no cover
                raise SyntaxError('Invalid wide Unicode character at %d!' % (i.index - 1))

        c = next(i)
        if c in ('0', '1'):
            value.append(c)
        else:  # pragma: no cover
            raise SyntaxError('Invalid wide Unicode character at %d!' % (i.index - 1))

        for x in range(4):
            c = next(i)
            if c.lower() in _HEX:
                value.append(c)
            else:  # pragma: no cover
                raise SyntaxError('Invalid wide Unicode character at %d!' % (i.index - 1))
        return ''.join(value)

    def get_narrow_unicode(self, i):
        """Get narrow Unicode."""

        value = []
        for x in range(4):
            c = next(i)
            if c.lower() in _HEX:
                value.append(c)
            else:  # pragma: no cover
                raise SyntaxError('Invalid Unicode character at %d!' % (i.index - 1))
        return ''.join(value)

    def parse_unicode(self, i, wide=False):
        """Parse Unicode."""

        text = self.get_wide_unicode(i) if wide else self.get_narrow_unicode(i)
        value = int(text, 16)
        single = self.get_single_stack()
        if self.span_stack:
            text = self.convert_case(_util.uchr(value), self.span_stack[-1])
            value = _util.uord(self.convert_case(text, single)) if single is not None else _util.uord(text)
        elif single:
            value = _util.uord(self.convert_case(_util.uchr(value), single))
        if value <= 0xFF:
            self.result.append('\\%03o' % value)
        else:
            self.result.append(_util.uchr(value))

    def get_byte(self, i):
        """Get byte."""

        value = []
        for x in range(2):
            c = next(i)
            if c.lower() in _HEX:
                value.append(c)
            else:  # pragma: no cover
                raise SyntaxError('Invalid byte character at %d!' % (i.index - 1))
        return ''.join(value)

    def parse_bytes(self, i):
        """Parse byte."""

        value = int(self.get_byte(i), 16)
        single = self.get_single_stack()
        if self.span_stack:
            text = self.convert_case(chr(value), self.span_stack[-1])
            value = _util.uord(self.convert_case(text, single)) if single is not None else _util.uord(text)
        elif single:
            value = _util.uord(self.convert_case(chr(value), single))
        self.result.append('\\%03o' % value)

    def get_named_group(self, t, i):
        """Get group number."""

        index = i.index
        value = [t]
        try:
            c = next(i)
            if c != "<":
                raise SyntaxError("Group missing '<' at %d!" % (i.index - 1))
            value.append(c)
            c = next(i)
            if c in _DIGIT:
                value.append(c)
                c = next(i)
                while c != '>':
                    if c in _DIGIT:
                        value.append(c)
                    c = next(i)
                value.append(c)
            elif c in _WORD:
                value.append(c)
                c = next(i)
                while c != '>':
                    if c in _WORD or c in _DIGIT:
                        value.append(c)
                    c = next(i)
                value.append(c)
            else:
                raise SyntaxError("Invalid group character at %d!" % (i.index - 1))
        except StopIteration:
            raise SyntaxError("Unmatched '<' at %d!" % index)

        return ''.join(value)

    def get_group(self, t, i):
        """Get group number."""

        try:
            value = []
            if t in _DIGIT and t != '0':
                value.append(t)
                t = next(i)
                if t in _DIGIT:
                    value.append(t)
                else:
                    i.rewind(1)
        except StopIteration:
            pass
        return ''.join(value) if value else None

    def reference(self, t, i):
        """Handle references."""
        octal = self.get_octal(t, i)
        if t in _OCTAL and (self.use_format or octal):
            if not octal:
                octal = self.get_group(t, i)
            self.parse_octal(octal)
        elif (t in _DIGIT or t == 'g') and not self.use_format:
            group = self.get_group(t, i)
            if not group:
                group = self.get_named_group(t, i)
            self.handle_group('\\' + group)
        elif t in _STANDARD_ESCAPES:
            self.get_single_stack()
            self.result.append('\\' + t)
        elif t == "l":
            self.single_case(i, _LOWER)
        elif t == "L":
            self.span_case(i, _LOWER)
        elif t == "c":
            self.single_case(i, _UPPER)
        elif t == "C":
            self.span_case(i, _UPPER)
        elif t == "E":
            self.end_found = True
        elif not self.binary and t == "U":
            self.parse_unicode(i, True)
        elif not self.binary and t == "u":
            self.parse_unicode(i)
        elif not self.binary and t == "N":
            self.parse_named_unicode(i)
        elif t == "x":
            self.parse_bytes(i)
        elif self.use_format and t in _CURLY_BRACKETS:
            self.result.append('\\\\')
            self.handle_format(t, i)
        elif self.use_format and t == 'g':
            self.result.append('\\\\')
            self.result.append(t)
        else:
            value = '\\' + t
            self.get_single_stack()
            if self.span_stack:
                value = self.convert_case(value, self.span_stack[-1])
            self.result.append(value)

    def parse_template(self, pattern):
        """Parse template."""

        i = _util.StringIter((self._original.decode('latin-1') if self.binary else self._original))
        iter(i)
        self.result = [""]

        while True:
            try:
                t = next(i)
                if self.use_format and t in _CURLY_BRACKETS:
                    self.handle_format(t, i)
                elif t == '\\':
                    try:
                        t = next(i)
                        self.reference(t, i)
                    except StopIteration:
                        self.result.append(t)
                        raise
                else:
                    self.result.append(t)

            except StopIteration:
                break

        if len(self.result) > 1:
            self.literal_slots.append("".join(self.result))
            del self.result[:]
            self.result.append("")
            self.slot += 1

        if self.binary:
            self._template = "".join(self.literal_slots).encode('latin-1')
        else:
            self._template = "".join(self.literal_slots)
        self.groups, self.literals = _sre_parse.parse_template(self._template, pattern)

    def span_case(self, i, case):
        """Uppercase or lowercase the next range of characters until end marker is found."""

        self.span_stack.append(case)
        self.end_found = False
        try:
            while not self.end_found:
                t = next(i)
                if self.use_format and t in _CURLY_BRACKETS:
                    self.handle_format(t, i)
                elif t == '\\':
                    try:
                        t = next(i)
                        self.reference(t, i)
                    except StopIteration:
                        self.result.append(t)
                        raise
                elif self.single_stack:
                    single = self.get_single_stack()
                    text = self.convert_case(t, case)
                    if single:
                        text = self.convert_case(text[0], single) + text[1:]
                    self.result.append(text)
                else:
                    self.result.append(self.convert_case(t, case))
                if self.end_found:
                    self.end_found = False
                    break
        except StopIteration:
            pass
        self.span_stack.pop()

    def convert_case(self, value, case):
        """Convert case."""

        if self.binary:
            cased = []
            for c in value:
                if c in _ASCII_LETTERS:
                    cased.append(c.lower() if case == _LOWER else c.upper())
                else:
                    cased.append(c)
            return "".join(cased)
        else:
            return value.lower() if case == _LOWER else value.upper()

    def single_case(self, i, case):
        """Uppercase or lowercase the next character."""

        self.single_stack.append(case)
        try:
            t = next(i)
            if self.use_format and t in _CURLY_BRACKETS:
                self.handle_format(t, i)
            elif t == '\\':
                try:
                    t = next(i)
                    self.reference(t, i)
                except StopIteration:
                    self.result.append(t)
                    raise
            else:
                self.result.append(self.convert_case(t, self.get_single_stack()))
        except StopIteration:
            pass

    def get_single_stack(self):
        """Get the correct single stack item to use."""

        single = None
        while self.single_stack:
            single = self.single_stack.pop()
        return single

    def get_capture(self, text):
        """Get the capture."""

        capture = -1
        base = 10
        try:
            index = text.index("[")
            capture = text[index + 1:-1]
            text = text[:index]
            prefix = capture[1:3] if capture[0] == "-" else capture[:2]
            if prefix[0:1] == "0":
                char = prefix[-1]
                if char == "b":
                    base = 2
                elif char == "o":
                    base = 8
                elif char == "x":
                    base = 16
        except ValueError:
            pass

        if not isinstance(capture, int):
            try:
                capture = int(capture, base)
            except ValueError:
                raise ValueError("Capture index must be an integer!")
        return text, capture

    def handle_format_group(self, text):
        """Handle groups."""

        text, capture = self.get_capture(text)

        # Handle auto or manual format
        if text == "":
            if self.auto:
                text = _util.string_type(self.auto_index)
                self.auto_index += 1
            elif not self.manual and not self.auto:
                self.auto = True
                text = _util.string_type(self.auto_index)
                self.auto_index += 1
            else:
                raise ValueError("Cannot switch to auto format during manual format!")
        elif not self.manual and not self.auto:
            self.manual = True
        elif not self.manual:
            raise ValueError("Cannot switch to manual format during auto format!")

        self.handle_group(text, capture, True)

    def handle_group(self, text, capture=-1, is_format=False):
        """Handle groups."""

        if len(self.result) > 1:
            self.literal_slots.append("".join(self.result))
            if is_format:
                self.literal_slots.extend(["\\g<", text, ">"])
            else:
                self.literal_slots.append(text)
            del self.result[:]
            self.result.append("")
            self.slot += 1
        elif is_format:
            self.literal_slots.extend(["\\g<", text, ">"])
        else:
            self.literal_slots.append(text)

        self.group_slots.append(
            (
                self.slot,
                (
                    self.span_stack[-1] if self.span_stack else None,
                    self.get_single_stack(),
                    capture
                )
            )
        )
        self.slot += 1

    def get_base_template(self):
        """Return the unmodified template before expansion."""

        return self._original

    def parse(self, pattern, template, use_format=False):
        """Parse template."""

        if isinstance(template, _util.binary_type):
            self.binary = True
        else:
            self.binary = False
        self._original = template
        self.use_format = use_format
        self.parse_template(pattern)

        return ReplaceTemplate(
            tuple(self.groups),
            tuple(self.group_slots),
            tuple(self.literals),
            hash(pattern),
            self.use_format
        )


class ReplaceTemplate(_util.Immutable):
    """Replacement template expander."""

    __slots__ = ("groups", "group_slots", "literals", "pattern_hash", "use_format", "_hash")

    def __init__(self, groups, group_slots, literals, pattern_hash, use_format):
        """Initialize."""

        super(ReplaceTemplate, self).__init__(
            use_format=use_format,
            groups=groups,
            group_slots=group_slots,
            literals=literals,
            pattern_hash=pattern_hash,
            _hash=hash(
                (
                    type(self),
                    groups, group_slots, literals,
                    pattern_hash, use_format
                )
            )
        )

    def __call__(self, m):
        """Call."""

        return self.expand(m)

    def __hash__(self):
        """Hash."""

        return self._hash

    def __eq__(self, other):
        """Equal."""

        return (
            isinstance(other, ReplaceTemplate) and
            self.groups == other.groups and
            self.group_slots == other.group_slots and
            self.literals == other.literals and
            self.pattern_hash == other.pattern_hash and
            self.use_format == other.use_format
        )

    def __ne__(self, other):
        """Equal."""

        return (
            not isinstance(other, ReplaceTemplate) or
            self.groups != other.groups or
            self.group_slots != other.group_slots or
            self.literals != other.literals or
            self.pattern_hash != other.pattern_hash or
            self.use_format != other.use_format
        )

    def __repr__(self):  # pragma: no cover
        """Representation."""

        return "%s.%s(%r, %r, %r, %r, %r)" % (
            self.__module__, self.__class__.__name__,
            self.groups, self.group_slots, self.literals,
            self.pattern_hash, self.use_format
        )

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

    def expand(self, m):
        """Using the template, expand the string."""

        if m is None:
            raise ValueError("Match is None!")

        sep = m.string[:0]
        text = []
        # Expand string
        for x in range(0, len(self.literals)):
            index = x
            l = self.literals[x]
            if l is None:
                g_index = self.get_group_index(index)
                span_case, single_case, capture = self.get_group_attributes(index)
                if capture not in (0, -1):
                    raise IndexError("'%d' is out of range!" % capture)
                l = m.group(g_index)
                if span_case is not None:
                    if span_case == _LOWER:
                        l = l.lower()
                    else:
                        l = l.upper()
                if single_case is not None:
                    if single_case == _LOWER:
                        l = l[0:1].lower() + l[1:]
                    else:
                        l = l[0:1].upper() + l[1:]
            text.append(l)

        return sep.join(text)


def _pickle(r):
    """Pickle."""

    return ReplaceTemplate, (r.groups, r.group_slots, r.literals, r.pattern_hash, r.use_format)


_util.copyreg.pickle(ReplaceTemplate, _pickle)
