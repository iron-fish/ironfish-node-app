/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at https://mozilla.org/MPL/2.0/. */

import { Assert } from "@ironfish/sdk";
import { orderBy } from "natural-orderby";

export interface TableColumn<T extends Record<string, unknown>> {
  // The return type of this function can be extended, it's really just to avoid
  // being `unknown`. Anything that has a `.toString()` function can be added
  // here with no extra changes.
  get(this: void, row: T): string | number | bigint | boolean;
  header: string;
  extended?: boolean;
  minWidth?: number;
}

export type TableColumns<T extends Record<string, unknown>> = {
  [key: string]: TableColumn<T>;
};

export interface TableOptions {
  [key: string]: unknown;
  extended?: boolean;
  "no-header"?: boolean;
  output?: string;
  printLine?(this: void, s: unknown): unknown;
  sort?: string;
  limit?: number;
}

export function table<T extends Record<string, unknown>>(
  data: T[],
  columns: TableColumns<T>,
  options: TableOptions = {},
): void {
  new Table(data, columns, options).render();
}

class Table<T extends Record<string, unknown>> {
  data: T[];
  columns: (TableColumn<T> & {
    extended: boolean;
    key: string;
    width?: number;
  })[];
  options: TableOptions & { extended: boolean; printLine(s: unknown): unknown };

  constructor(data: T[], columns: TableColumns<T>, options: TableOptions) {
    this.data = data;
    this.columns = Object.entries(columns).map(([key, column]) => {
      const extended = column.extended || false;
      return {
        ...column,
        extended,
        key,
      };
    });
    this.options = {
      extended: options.extended || false,
      "no-header": options["no-header"],
      output: options.csv ? "csv" : options.output,
      printLine: options.printLine ?? console.log,
      sort: options.sort,
      limit: options.limit ?? 50,
    };
  }

  render() {
    // Generate the rendered text to be displayed
    let rows: Record<string, string>[] = [];
    for (const data of this.data) {
      const row: Record<string, string> = {};
      for (const column of this.columns) {
        // Only show columns marked as extended if the table is set to show
        // extended columns
        if (!this.options.extended && column.extended === true) {
          continue;
        }
        row[column.key] = column.get(data).toString();
      }
      rows.push(row);
    }

    // Sort the rows given the column to sort by
    if (this.options.sort) {
      let sortOrder: "asc" | "desc";
      let header: string;
      if (this.options.sort[0] === "-") {
        sortOrder = "desc";
        header = this.options.sort.slice(1);
      } else {
        sortOrder = "asc";
        header = this.options.sort;
      }

      const column = this.columns.find(
        (c) => c.header.toLowerCase() === header.toLowerCase(),
      );
      Assert.isNotUndefined(column, `No column found with name '${header}'`);

      rows = orderBy(rows, column.key, sortOrder);
    }

    switch (this.options.output) {
      case "csv": {
        this.renderCsv(rows);
        break;
      }

      default: {
        this.renderCsv(rows);
      }
    }
  }

  renderCsv(rows: Record<string, string>[]) {
    const columnHeaders = [];
    for (const column of this.columns) {
      // Only show columns marked as extended if the table is set to show
      // extended columns
      if (!this.options.extended && column.extended === true) {
        continue;
      }
      columnHeaders.push(sanitizeCsvValue(column.header));
    }
    if (!this.options["no-header"]) {
      this.options.printLine(columnHeaders.join(","));
    }

    for (const row of rows) {
      const rowValues = [];
      for (const value of Object.values(row)) {
        rowValues.push(sanitizeCsvValue(value));
      }
      this.options.printLine(rowValues.join(","));
    }
  }
}

function sanitizeCsvValue(value: string): string {
  const newValue = value;

  // Double-quotes must be escaped with another double-quote
  newValue.replace('"', '""');

  // If the value contains any of these special characters, it needs to be
  // wrapped in double-quotes
  if (
    newValue.includes('"') ||
    newValue.includes("\r") ||
    newValue.includes("\n") ||
    newValue.includes(",")
  ) {
    return `"${newValue}"`;
  }

  return newValue;
}
