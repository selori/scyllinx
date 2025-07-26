---
title: Migration
---

# Migration








## Migration


Abstract base class for database migrations.
Provides structure for creating reversible database schema changes.
Each migration should implement both &#x60;up()&#x60; and &#x60;down()&#x60; methods to support
forward and backward migration operations.





## getName


Gets the migration class name.
Used for tracking which migrations have been executed.




  `returns` — The class name of the migration



## getTimestamp


Extracts timestamp from migration class name or generates current timestamp.
Migration class names should follow the format: YYYY_MM_DD_HHMMSS_MigrationName
If no timestamp is found in the class name, returns current timestamp.




  `returns` — Timestamp string in format YYYYMMDDHHMMSS



