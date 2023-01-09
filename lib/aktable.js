const ak_jscore = require('./akcore');

/** Gestione tabelle */
class ak_jstable extends ak_jscore {
    /**
     * Gestione tabelle database
     * @param {Object} option - Connessione al db 
     * */
    constructor(option) {
        super(option); 
    }

    /**
     * Crea nuova tabella
     * @param {String} table Nome tabella<br>
     * @return {String}.
     * */
    CreateTable(table, engine = "InnoDB") {
        let query = `CREATE TABLE ${table} (id int(11) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id)) ENGINE = ${engine}`;
        this.Query(query);
    }

    /**
     * Rinomina tabella
     * @param {String} oldName Nome attuale tabella<br>
     * @param {String} newName Nuovo Nome tabella<br>
     * @return {String}.
     * */
    RenameTable(oldname, newname) {
        let query = `RENAME TABLE ${oldname} TO ${newname}`;
        this.Query(query);
    }

    /**
     * Cancella tabella
     * @param {String} table Nome tabella<br>
     * @return {String}.
     * */
    DeleteTable(table) {
        let query = `DROP TABLE IF EXISTS ${table}`;
        this.Query(query);
    }

    /**
     * Svuota tabella
     * @param {String} table Nome tabella<br>
     * @return {String}.
     * */
    EmptyTable(table) {
        let query = `TRUNCATE TABLE IF EXISTS ${table}`;
        this.Query(query);
    }

    /**
     * Aggiungi colonne a tabella
     * @param {String} table Nome tabella<br>
     * @param {Array} columns Nome colonna, datatype e definizione <br>
     * es: [<br>
     *          {"name":"nome_colonna","datatype":"varchar(255)","default":"NOT NULL","order":"AFTER nome_altra_colonna"},<br>
     *          {...}<br>
     *     ]<br>
     * @return {String}.
     * */
    AddColumns(table, columns) {
        if (typeof table === 'undefined') {
            return false;
        }

        let stringcol = [];
        columns.forEach(function (col) {
            let c = "";
            if (typeof col.name !== 'undefined') {
                c = " ADD COLUMN " + col.name;
            } else {
                return false;
            }

            if (typeof col.datatype !== 'undefined') {
                c += " " + col.datatype;
            } else {
                c += " " + "varchar(255)";
            }

            if (typeof col.default !== 'undefined') {
                c += " " + col.default;
            } else {
                c += " " + "NULL";
            }

            if (typeof col.order !== 'undefined') {
                c += " " + col.order;
            }

            stringcol.push(c);
        })

        let query = `ALTER TABLE ${table} ${stringcol.join(" , ")}`;

        this.Query(query);
    }

    /**
     * Modifica colonna
     * @param {String} table Nome tabella<br>
     * @param {Array} column Nome colonna, Nuovo nome, nuovo datatype<br>
     * es: {
     *      "name":"nome_colonna","newname":"nuovo_nome","datatype":"varchar(255)"
     * }
     * @return {String}.
     * */
    EditColumn(table, col) {
        let c;
        let error = [];
        if (typeof table === 'undefined') {
            error.push("Manca nome Tabella");
        }

        if (typeof col.name !== 'undefined') {
            c = " CHANGE " + col.name;
            if (typeof col.newname !== 'undefined') {
                c = " CHANGE " + col.name;
            } else {
                c = " MODIFY " + col.name;
            }
        } else {
            error.push("Manca nome colonna");
        }

        if (typeof col.newname !== 'undefined') {
            c += " " + col.newname;
        }

        if (typeof col.datatype !== 'undefined') {
            c += " " + col.datatype;
        } else {
            error.push("Manca DataType");
        }

        if (error.length > 0) {
            console.log(error);
            return error;
        } else {
            let query = `ALTER TABLE ${table} ${c}`;
            let result = this.Query(query);
            return result;
        }
    }
}

module.exports = ak_jstable;