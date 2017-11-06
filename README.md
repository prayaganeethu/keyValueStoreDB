# GeekDB

GeekDB is a key value store database. Used my own json parser (jsonParser.js).

To start with the DB:
```
node REPL.js
```

Supports the below mentioned operations.

## Commands:

Note: Commands are case-sensitive. Everything in square brackets are optional.

**Insert:**

```
insert key1[.[key2].~~.[keyN]] value
```

**Delete:**

```
delete key1[.[key2].~~.[keyN]]
```

**List all key-value pairs:**

```
listAll
```

**Show a specific key value:**

```
show key1[.[key2].~~.[keyN]]
```

**Update a key value:**

```
update key1[.[key2].~~.[keyN]] new-value
```
