"""
Utilities and compatibility abstraction.

Licensed under MIT
Copyright (c) 2015 - 2020 Isaac Muse <isaacmuse@gmail.com>
"""
import sys
import warnings

PY34 = (3, 4) <= sys.version_info
PY36 = (3, 6) <= sys.version_info
PY37 = (3, 7) <= sys.version_info

FMT_FIELD = 0
FMT_INDEX = 1
FMT_ATTR = 2
FMT_CONV = 3
FMT_SPEC = 4


class StringIter(object):
    """Preprocess replace tokens."""

    def __init__(self, text):
        """Initialize."""

        self._string = text
        self._index = 0

    def __iter__(self):
        """Iterate."""

        return self

    def __next__(self):
        """Python 3 iterator compatible next."""

        return self.iternext()

    @property
    def index(self):
        """Get Index."""

        return self._index

    def rewind(self, count):
        """Rewind index."""

        if count > self._index:  # pragma: no cover
            raise ValueError("Can't rewind past beginning!")

        self._index -= count

    def iternext(self):
        """Iterate through characters of the string."""

        try:
            char = self._string[self._index]
            self._index += 1
        except IndexError:
            raise StopIteration

        return char


def _to_bstr(l):
    """Convert to byte string."""

    if isinstance(l, str):
        l = l.encode('ascii', 'backslashreplace')
    elif not isinstance(l, bytes):
        l = str(l).encode('ascii', 'backslashreplace')
    return l


def format_string(m, l, capture, is_bytes):
    """Perform a string format."""

    for fmt_type, value in capture[1:]:
        if fmt_type == FMT_ATTR:
            # Attribute
            l = getattr(l, value)
        elif fmt_type == FMT_INDEX:
            # Index
            l = l[value]
        elif fmt_type == FMT_CONV:
            if is_bytes:
                # Conversion
                if value in ('r', 'a'):
                    l = repr(l).encode('ascii', 'backslashreplace')
                elif value == 's':
                    # If the object is not string or byte string already
                    l = _to_bstr(l)
            else:
                # Conversion
                if value == 'a':
                    l = ascii(l)
                elif value == 'r':
                    l = repr(l)
                elif value == 's':
                    # If the object is not string or byte string already
                    l = str(l)
        elif fmt_type == FMT_SPEC:
            # Integers and floats don't have an explicit 's' format type.
            if value[3] and value[3] == 's':
                if isinstance(l, int):  # pragma: no cover
                    raise ValueError("Unknown format code 's' for object of type 'int'")
                if isinstance(l, float):  # pragma: no cover
                    raise ValueError("Unknown format code 's' for object of type 'float'")

            # Ensure object is a byte string
            l = _to_bstr(l) if is_bytes else str(l)

            spec_type = value[1]
            if spec_type == '^':
                l = l.center(value[2], value[0])
            elif spec_type == ">":
                l = l.rjust(value[2], value[0])
            else:
                l = l.ljust(value[2], value[0])

    # Make sure the final object is a byte string
    return _to_bstr(l) if is_bytes else str(l)


class Immutable(object):
    """Immutable."""

    __slots__ = tuple()

    def __init__(self, **kwargs):
        """Initialize."""

        for k, v in kwargs.items():
            super(Immutable, self).__setattr__(k, v)

    def __setattr__(self, name, value):
        """Prevent mutability."""

        raise AttributeError('Class is immutable!')


def warn_deprecated(message, stacklevel=2):  # pragma: no cover
    """Warn deprecated."""

    warnings.warn(
        message,
        category=DeprecationWarning,
        stacklevel=stacklevel
    )
