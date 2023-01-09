'use strict';
const mysql = require('mysql');
const fs = require('fs');
/**
 * Description of Track
 *
 * @author Alkemika Lab
 */
 class ak_jsdb{
    /**
     * <p>
     * Gestione database
     * </p>
     * @param {Object} option - Connessione al db
     * */
    constructor(option){
        this.option = option ;
        let rawdata = fs.readFileSync('conn.json');
        let dataconn = JSON.parse(rawdata);
        this.conn=mysql.createConnection(dataconn);
    }

    

    /**
     * <p>
     * Invia Query
     * </p>
     * @param {String} query Stringa Query<br>
     * @return {Object}.
     * */
    Query(query){
        query=query.replace(/  +/g, ' ');
        console.log(query)
        this.conn.query(query, function (err, result) {
            if (err) {
                console.log(err.sqlMessage);
            }else{
                console.log(result);
            }
          });
        return query
    }

    /**
     * <p>
     * Salva tracciamento
     * </p>
     * @param $get array dati del link<br>
     * array request get o post.
     * @return array.
     * */
    print(){
        console.log('Name is :'+ this.option);
     }

}


/** Gestione tabelle */
class ak_jstable extends ak_jsdb {
    /**
     * <p>
     * Crea nuova tabella
     * </p>
     * @param {String} table Nome tabella<br>
     * @return {String}.
     * */
    CreateTable(table, engine = "InnoDB") {
        let query = `CREATE TABLE ${table} (id int(10) NOT NULL AUTO_INCREMENT, PRIMARY KEY (id)) ENGINE = ${engine}`;
        this.Query(query);
    }

    /**
     * <p>
     * Rinomina tabella
     * </p>
     * @param {String} oldName Nome attuale tabella<br>
     * @param {String} newName Nuovo Nome tabella<br>
     * @return {String}.
     * */
    RenameTable(oldname, newname) {
        let query = `RENAME TABLE ${oldname} TO ${newname}`;
        this.Query(query);
    }

    /**
     * <p>
     * Cancella tabella
     * </p>
     * @param {String} table Nome tabella<br>
     * @return {String}.
     * */
    DeleteTable(table) {
        let query = `DROP TABLE ${table}`;
        this.Query(query);
    }

    /**
     * <p>
     * Svuota tabella
     * </p>
     * @param {String} table Nome tabella<br>
     * @return {String}.
     * */
    EmptyTable(table) {
        let query = `TRUNCATE TABLE ${table}`;
        this.Query(query);
    }

    /**
     * <p>
     * Aggiungi colonne a tabella
     * </p>
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
     * <p>
     * Modifica colonna
     * </p>
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
module.exports = ak_jsdb;