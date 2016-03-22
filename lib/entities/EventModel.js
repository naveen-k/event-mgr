module.exports = {
    "fields": {
        "id" : {
          "type": "varchar",
          "default": null
        },
        "group_id" : {
          "type": "varchar",
          "default": null
        },
        "description": {
          "type": "varchar",
          "default": null
        },
        "category": {
          "type": "varchar",
          "default": null
        },
        "date" : {
          "type": "varchar",
          "default" : null
        },
        "options": {
            "type": "map",
            "typeDef": "<varchar, varchar>"
        },
        "created" : {
          "type": "timestamp",
          "default" : { "$db_function": "dateOf(now())" }
        },
    },
    "key" :["id","group_id", "date","description","category"],
    "indexes": ["group_id","date","description","category"]
}