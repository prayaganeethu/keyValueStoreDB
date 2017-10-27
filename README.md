# GeekDB

GeekDB is a key value store database.
Run REPL.js to start with the DB.
Used my own json parser (jsonParser.js).
Supports the below mentioned operations.

## Commands:

Note: Commands are case-sensitive. Everything in square brackets are optional.

**Insert:**
insert key1[.[key2].~~.[keyN]] value

**Delete:**
delete key1[.[key2].~~.[keyN]]

**List all key-value pairs:**
listAll
(Shows the count of key value pairs in the DB as well)

**Show a specific key value:**
show key1[.[key2].~~.[keyN]]

**Update a key value:**
update key1[.[key2].~~.[keyN]] new-value
