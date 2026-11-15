from html.parser import HTMLParser
import re

class GridTableParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.tables = []
        self.in_table = False
        self.in_cell = False
        self.cell_tag = None
        self.cell_attrs = {}
        self.cell_text = []
        self.grid = [] # list of lists
        self.row_idx = -1
        self.col_idx = 0

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        if tag == 'table':
            self.in_table = True
            self.grid = []
            self.row_idx = -1
        elif tag == 'tr' and self.in_table:
            self.row_idx += 1
            if len(self.grid) <= self.row_idx:
                self.grid.append([])
            self.col_idx = 0
        elif tag in ('td', 'th') and self.in_table:
            self.in_cell = True
            self.cell_tag = tag
            self.cell_attrs = attrs_dict
            self.cell_text = []

    def handle_endtag(self, tag):
        if tag == 'table' and self.in_table:
            self.in_table = False
            self.tables.append(self.grid)
        elif tag in ('td', 'th') and self.in_cell:
            self.in_cell = False
            text = ''.join(self.cell_text).strip()
            rowspan = int(self.cell_attrs.get('rowspan', 1))
            colspan = int(self.cell_attrs.get('colspan', 1))

            # Find next available col_idx in current row
            current_row = self.grid[self.row_idx]
            while len(current_row) > self.col_idx and current_row[self.col_idx] is not None:
                self.col_idx += 1

            # Fill grid for rowspan and colspan
            for r in range(rowspan):
                target_r = self.row_idx + r
                while len(self.grid) <= target_r:
                    self.grid.append([])
                target_row = self.grid[target_r]
                for c in range(colspan):
                    target_c = self.col_idx + c
                    while len(target_row) <= target_c:
                        target_row.append(None)
                    target_row[target_c] = text
            self.col_idx += colspan

    def handle_data(self, data):
        if self.in_cell:
            self.cell_text.append(data)

def parse_html_tables(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        html = f.read()
    parser = GridTableParser()
    parser.feed(html)
    return parser.tables

tables = parse_html_tables('data_raw/head.html')
print("Total tables in head.html:", len(tables))
total_rows = 0
for idx, t in enumerate(tables):
    if len(t) > 0:
        header = t[0]
        if '防具名称' in header:
            print(f"Table {idx} has {len(t)} rows, header: {header}")
            total_rows += len(t) - 1
            for r in t[1:3]:
                print("  Row:", r)
print("Total armor rows across tables:", total_rows)
