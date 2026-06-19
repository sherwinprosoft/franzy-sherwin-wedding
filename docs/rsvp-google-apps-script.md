# RSVP Google Sheets Setup

This site uses Google Sheets as the RSVP source of truth and Google Apps Script
as the small write API. Each household receives one private link:

```text
https://your-domain.com/rsvp/HOUSEHOLD_TOKEN
```

The page shows every invited person in that household, so attendance can be
tracked per guest without sending separate links to every person.

## Sheet

Create a Google Sheet with a tab named `RSVP` and this header row:

```text
token,householdName,guestId,guestName,status,note,updatedAt
```

Example rows:

```text
ora-family-8Gx92,Ora Family,glenn-edward-ora,Glenn Edward Ora,Pending,,
ora-family-8Gx92,Ora Family,czarina-ora,Czarina Ora,Pending,,
lopez-family-4Jk11,Lopez Family,jella-lopez,Jella Lopez,Pending,,
lopez-family-4Jk11,Lopez Family,mark-lopez,Mark Lopez,Pending,,
```

Status values:

```text
Coming
Not Coming
Pending
```

Use long, random, unguessable token values before sending links to guests.
Use a stable, unique `guestId` per guest inside the same household.

## Apps Script

Open the Sheet, then go to `Extensions > Apps Script`. Paste this script:

```js
const SHEET_NAME = "RSVP";
const SECRET_PROPERTY = "RSVP_SCRIPT_SECRET";
const VALID_STATUSES = ["Coming", "Not Coming", "Pending"];

function doGet(event) {
  return handleRequest(function () {
    verifySecret(event.parameter.secret);

    const action = String(event.parameter.action || "").trim();

    if (action === "publicList") {
      return { ok: true, publicList: getPublicList() };
    }

    const token = String(event.parameter.token || "").trim();
    const rows = findRowsByToken(token);

    if (rows.length === 0) {
      throw new Error("RSVP link not found.");
    }

    return { ok: true, party: rowsToParty(rows) };
  });
}

function doPost(event) {
  return handleRequest(function () {
    const body = JSON.parse(event.postData.contents || "{}");
    verifySecret(body.secret);

    const token = String(body.token || "").trim();
    const rows = findRowsByToken(token);

    if (rows.length === 0) {
      throw new Error("RSVP link not found.");
    }

    const updates = normalizeGuestUpdates(body.guests);

    if (updates.length === 0) {
      throw new Error("No guest RSVP updates were submitted.");
    }

    const updateByGuestId = updates.reduce(function (record, update) {
      record[update.id] = update.status;
      return record;
    }, {});
    const matchedRows = rows.filter(function (row) {
      const guestId = String(row.values.guestId || "").trim();
      return Boolean(updateByGuestId[guestId]);
    }).length;

    if (matchedRows === 0) {
      throw new Error("No matching guest rows found.");
    }

    const note = String(body.note || "").trim();
    const updatedAt = new Date().toISOString();
    const sheet = getSheet();
    const headers = getHeaders(sheet);

    const updatedRows = rows.map(function (row) {
      const guestId = String(row.values.guestId || "").trim();
      const nextStatus = updateByGuestId[guestId];
      const values = {
        ...row.values,
        note: note,
        updatedAt: updatedAt,
      };

      setCell(sheet, row.index, headers, "note", note);
      setCell(sheet, row.index, headers, "updatedAt", updatedAt);

      if (nextStatus) {
        values.status = nextStatus;
        setCell(sheet, row.index, headers, "status", nextStatus);
      }

      return {
        index: row.index,
        values: values,
      };
    });

    return { ok: true, party: rowsToParty(updatedRows) };
  });
}

function handleRequest(callback) {
  try {
    return json(callback());
  } catch (error) {
    return json({ ok: false, error: error.message || "RSVP error." });
  }
}

function verifySecret(value) {
  const expected = PropertiesService.getScriptProperties().getProperty(SECRET_PROPERTY);

  if (!expected || value !== expected) {
    throw new Error("Unauthorized RSVP request.");
  }
}

function getSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error("RSVP sheet not found.");
  }

  return sheet;
}

function getHeaders(sheet) {
  return sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    .map(function (header) {
      return String(header).trim();
    });
}

function findRowsByToken(token) {
  if (!token) {
    return [];
  }

  const sheet = getSheet();
  const headers = getHeaders(sheet);
  const values = sheet.getDataRange().getValues();
  const tokenIndex = headers.indexOf("token");

  if (tokenIndex === -1) {
    throw new Error("Missing token column.");
  }

  return values.slice(1).reduce(function (rows, row, offset) {
    if (String(row[tokenIndex]).trim() === token) {
      rows.push({
        index: offset + 2,
        values: rowObject(headers, row),
      });
    }

    return rows;
  }, []);
}

function rowObject(headers, values) {
  return headers.reduce(function (record, header, index) {
    record[header] = values[index];
    return record;
  }, {});
}

function rowsToParty(rows) {
  const first = rows[0].values;
  const guests = rows.map(function (row) {
    return rowToGuest(row.values);
  }).filter(Boolean);

  if (guests.length === 0) {
    throw new Error("RSVP link has no guest rows.");
  }

  return {
    token: String(first.token || "").trim(),
    householdName: String(first.householdName || "Guest Party").trim(),
    guests: guests,
    note: getFirstValue(rows, "note"),
    updatedAt: getLatestValue(rows, "updatedAt"),
  };
}

function getPublicList() {
  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  const headers = getHeaders(sheet);
  const confirmedHouseholds = {};
  const attendees = values.slice(1).reduce(function (list, row) {
    const record = rowObject(headers, row);
    const guest = rowToGuest(record);

    if (!guest || guest.status !== "Coming") {
      return list;
    }

    const token = String(record.token || "").trim();
    const householdName = String(record.householdName || "").trim();
    const householdKey = token || householdName || guest.id;

    confirmedHouseholds[householdKey] = true;
    list.push({ name: guest.name });

    return list;
  }, []);

  attendees.sort(function (first, second) {
    return first.name.localeCompare(second.name);
  });

  return {
    attendees: attendees,
    confirmedHouseholds: Object.keys(confirmedHouseholds).length,
  };
}

function rowToGuest(row) {
  const id = String(row.guestId || "").trim();
  const name = String(row.guestName || "").trim();

  if (!id || !name) {
    return null;
  }

  return {
    id: id,
    name: name,
    status: normalizeStatus(row.status),
    updatedAt: String(row.updatedAt || "").trim(),
  };
}

function normalizeGuestUpdates(value) {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.reduce(function (updates, item) {
    const record = item || {};
    const id = String(record.id || "").trim();

    if (id) {
      updates.push({
        id: id,
        status: normalizeStatus(record.status),
      });
    }

    return updates;
  }, []);
}

function normalizeStatus(value) {
  const status = String(value || "Pending").trim();
  const statusKey = status.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

  if (VALID_STATUSES.indexOf(status) !== -1) {
    return status;
  }

  if ([
    "attending",
    "coming",
    "confirmed",
    "going",
    "will attend",
    "yes",
  ].indexOf(statusKey) !== -1) {
    return "Coming";
  }

  if ([
    "cannot attend",
    "declined",
    "not attending",
    "not coming",
    "no",
    "unable",
    "unable to attend",
    "will not attend",
  ].indexOf(statusKey) !== -1) {
    return "Not Coming";
  }

  return "Pending";
}

function getFirstValue(rows, key) {
  for (let index = 0; index < rows.length; index += 1) {
    const value = String(rows[index].values[key] || "").trim();

    if (value) {
      return value;
    }
  }

  return "";
}

function getLatestValue(rows, key) {
  return rows.reduce(function (latest, row) {
    const value = String(row.values[key] || "").trim();

    if (!value || (latest && value <= latest)) {
      return latest;
    }

    return value;
  }, "");
}

function setCell(sheet, rowIndex, headers, key, value) {
  const columnIndex = headers.indexOf(key);

  if (columnIndex === -1) {
    throw new Error("Missing " + key + " column.");
  }

  sheet.getRange(rowIndex, columnIndex + 1).setValue(value);
}

function json(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## Script Secret

In Apps Script, go to `Project Settings > Script Properties` and add:

```text
RSVP_SCRIPT_SECRET=<a long random secret>
```

Use the same value in Vercel.

## Deploy

1. Apps Script: `Deploy > New deployment`.
2. Type: `Web app`.
3. Execute as: `Me`.
4. Who has access: `Anyone`.
5. Copy the Web App URL.

Add these Vercel environment variables:

```text
RSVP_SCRIPT_URL=<Apps Script Web App URL>
RSVP_SCRIPT_SECRET=<same secret from Script Properties>
```

The public `/rsvp` page uses `action=publicList` and does not require listing
every household token in Vercel. Only guests marked `Coming` are displayed
publicly. Tokens, notes, pending responses, and declined responses are not
returned by the public list response.

Redeploy the site after setting the environment variables.
