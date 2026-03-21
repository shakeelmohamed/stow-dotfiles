import sublime, sublime_plugin


class NumberLinesCommand(sublime_plugin.TextCommand):
    def run(self, edit):
        lines = self.view.lines(sublime.Region(0, self.view.size()))
        total = len(lines)
        for i, region in enumerate(reversed(lines), 1):
            self.view.insert(edit, region.begin(), str(total - i + 1) + ". ")
