"use strict";
const ak_jscore = require('./akcore');

/** Query */
class ak_jsquery extends ak_jscore {
    /**
     * Query database
     * @param {Object} option - Connessione al db 
     * */
    constructor(option) {
        super(option);
        this.ev = "";
        this.onlyone = false;
        this.table = "";
        this.option = {};
        this.fields = "*";
        this.msgError = [];
        this.error = false;
        this.sql = "";
        this.gloss = {
            from: "FROM",
            as: "AS",
            distinct: "DISTINCT",
            join: "JOIN",
            on: "ON",
            where: "WHERE",
            and: "AND",
            or: "OR",
            order: "ORDER BY",
            limit: "LIMIT",
            group: "GROUP BY",
            values: "VALUES",
            set: "SET",
        }
        this.path = {
            _type: "",
            _table: "",
            _columns: "",
            _values: "",
            _from: "",
            _join: "",
            _where: "",
            _group: "",
            _order: "",
            _limit: "",
            _having: "",
        }
        this.typeRequest={
            "select":{
                "table": false, 
                "values": false, 
                "from": true, 
            },
            "insertinto":{
                "table": true, 
                "columns": true, 
                "values": true, 
                "from": false, 
                "joins": false, 
                "where": false,
                "order": false,
                "limit": false,
                "group": false,
                "having": false,
            },
            "update":{
                "table": true, 
                "columns": true, 
                "values": false, 
                "from": false, 
                "joins": false, 
                "where": true,
                "order": false,
                "limit": false,
                "group": false,
                "having": false,
            },
            "delete":{
                "table": false, 
                "columns": false, 
                "values": false, 
                "from": true, 
                "joins": false, 
                "where": true,
                "order": false,
                "limit": false,
                "group": false,
                "having": false,
            }
        }
    }
    
    async run(debug = false) {
        this.option['msgError'] = [];
        
        if (!this.option.columns && this.option.type == "select") {
            option.columns = "*";
        }
        
        if (!this.#quotetable(this.option.table)) {
            this.msgerror = "Errore: nome tabella errato";
            this.option['msgError'] = this.msgError;
        }

        if (this.option['msgError'].length>0) {
            this.error = true
            this.option['error'] = true
        }

        this.path._type = this.option.type.toUpperCase();
        this.path._table = this.option.table;
        this.path._columns = this.option.columns;
        this.path._values = this.option.values;
        this.path._from = this.option.from;
        this.path._join = this.option.joins;
        this.path._where = this.option.where;
        this.path._group = this.option.group;
        this.path._order = this.option.order;
        this.path._limit = this.option.limit;
        this.path._having = this.option.having;
        
        let _checkPath=this.#checkPath();
        if(_checkPath.state){
            this.option.msgError.push(_checkPath.error)
            this.error = true
        }

        let path_value = Object.values(this.path)

        let pathsql = path_value.filter(Boolean).join(" ");
        if (pathsql) {
            this.option['sql'] = pathsql;
        }
        let result;
        if (!debug) {
            if(!this.error){
                result = await this.Query(pathsql)
                if(this.onlyone){
                    return result[0];
                }else{
                    return result;
                }
            }else{
                return this.option.msgError; 
            }
        } else {
            console.log(pathsql)
            console.log(this.option) 
            return pathsql;
        }
    }

    /**
     * Seleziona colonne per la query ritorna un solo elemento
     * @param {string} from - nome tabella  
     * @param {array} columns - elenco colonne  
     * es: 
     * ```js
     * let columns=[
     *          "*", // tutte le colonne
     *          "nomecolonna1", // nome colonna semplice
     *          "nomecolonna2#aliasnome", // '#' per ALIAS es return:  nomecolonna2 AS aliasnome
     *          "nomecolonna3@", // '@' finale per DISTICT colonna la colonna sarà posizionata in alto es return: DISTICT nomecolonna3, nomecolonna2
     *           {
     *              setfunc: ["sum", "aaaa*bbbbb", "#somma"] 
     *           }// primo valore funzione, 2°/3°... valori funzione, ultimo valore se con # diventa alias
     *           {
     *              setfunc: ["IF", "field4>'5'", { setfunc: ["MONTH", "field5"] }, { setfunc: ["min", "sss"] }, "#diff"] // possibilità di incorporare funzioni in funzioni
     *           }
     *     ];
     * query.findOne("nometabella",columns).query(...);
     * ```
     **/
    findOne(table, columns = "*") {
        this.select(table,columns,true);
        return this;
    }


    /**
     * Seleziona colonne per la query
     * @param {string} from - nome tabella  
     * @param {array} columns - elenco colonne  
     * es: 
     * ```js
     * let columns=[
     *          "*", // tutte le colonne
     *          "nomecolonna1", // nome colonna semplice
     *          "nomecolonna2#aliasnome", // '#' per ALIAS es return:  nomecolonna2 AS aliasnome
     *          "nomecolonna3@", // '@' finale per DISTICT colonna la colonna sarà posizionata in alto es return: DISTICT nomecolonna3, nomecolonna2
     *           {
     *              setfunc: ["sum", "aaaa*bbbbb", "#somma"] 
     *           }// primo valore funzione, 2°/3°... valori funzione, ultimo valore se con # diventa alias
     *           {
     *              setfunc: ["IF", "field4>'5'", { setfunc: ["MONTH", "field5"] }, { setfunc: ["min", "sss"] }, "#diff"] // possibilità di incorporare funzioni in funzioni
     *           }
     *     ];
     * query.select("nometabella",columns).query(...);
     * ```
     **/
    select(table, columns = "*",fromfindone=false) {
        this.#initialize();
        if(fromfindone){
            this.onlyone=true;
        }

        this.ev = "select"
        this.option['table'] = "";
        this.option['from'] = `${this.gloss.from} ${table}`;
        this.option['type'] = "select";
        this.option['values'] = ""
        let ckcolumns;

        if (Array.isArray(columns)) {
            let arrColumns = [];
            columns.forEach((column) => {
                if (typeof column === "string") {
                    let hasAlias = false;
                    let isDistinct = false;
                    let isAll = false;
                    let path = {
                        _distinct: "",
                        _name: "",
                        _alias: ""
                    }

                    column = this.#DelSpace(column)

                    if (column === "*") {
                        isAll = true;
                        path._name = column
                    }

                    /* Alias */
                    let newColumn;
                    if (column.includes("#") && column.length > 1 && !isAll) {
                        hasAlias = true;
                        newColumn = column.split("#");
                        let col = this.#DelSpecialChar(newColumn[0])
                        let als = this.#DelSpecialChar(newColumn[1]);
                        path._name = col
                        path._alias = `${this.gloss.as} ${als}`
                    }

                    /* Distinct */
                    if (column.startsWith("@") && column.length > 1 && !isAll) {
                        isDistinct = true;
                        if (!hasAlias) {
                            column = column.replace(/@/g, '');
                            path._name = column;
                        }
                        path._distinct = this.gloss.distinct;
                    }
                    let path_value = Object.values(path)
                    let pathjoin = path_value.filter(Boolean).join(" ");
                    if (pathjoin) {
                        arrColumns.push(pathjoin)
                    }
                }
                /* Function */
                if (this.#isFunction(column)) {
                    let setfunc = this.#setfunction(column);
                    arrColumns.push(setfunc);
                }
            })
            ckcolumns = arrColumns.join(", ");
        } if (typeof columns === "string") {
            if (columns === "*") {
                ckcolumns = columns
            } else {
                ckcolumns = this.#DelSpecialChar(columns);
            }
        }
        this.option['columns'] = ckcolumns;
        return this;
    }

    /**
     * Inserisci valori nel db
     * @param {string} table - nome tabella  
     * @param {array} value - valori  
     * es: 
     * ```js
     * let value={
     *          "field1":"value1",
     *          "field2":"value2",
     *          "field3":"value3"
     *     };
     * OR
     * let value=[
     *          {
     *          "field1":"value1"
     *          "field2":"value2"
     *          },
     *          {
     *          "field1":"value3"
     *          "field2":"value4"
     *          }
     * ];      
     * query.insert("nometabella",value);
     * ```
     **/
    insert(table, values) {
        this.#initialize();
        let _dataColumns, _dataValues = []
        if (Array.isArray(values)) {
            values.forEach((row) => {
                if (typeof row === "object") {
                    const { dataColumns, dataValues } = this.#getinsertvalue(row);
                    _dataColumns = `(${dataColumns})`
                    _dataValues.push(`(${dataValues})`)
                }
            })
        } else {
            if (typeof values === "object") {
                const { dataColumns, dataValues } = this.#getinsertvalue(values);
                _dataColumns = `(${dataColumns})`
                _dataValues.push(`(${dataValues})`)
            }
        }

        this.option['type'] = "insert into";
        this.option['table'] = table;
        this.option['columns'] = _dataColumns;
        this.option['values'] = `${this.gloss.values} ${_dataValues.join(", ")}`;
        return this;
    }

    /**
     * Aggiorna valori nel db
     * @param {string} table - nome tabella  
     * @param {array} value - valori  
     * es: 
     * ```js
     * let value={
     *          "field1":"value1",
     *          "field2":"value2",
     *          "field3":"value3"
     *     };
     * query.update("nometabella",value).where(...);
     * ```
     **/
    update(table, values) {
        this.#initialize();
        let _dataValues = []
        const operators=["-","+","*","/"]
        if (typeof values === "object") {
            for (const [column, val] of Object.entries(values)) {     
                if(column.includes("#")){
                    const [columnsplit,operator]=column.split("#");
                    if(operators.includes(operator)){
                        _dataValues.push(`${columnsplit} = ${columnsplit} ${operator} ${this.#sanitizestring(val)}`)
                    }else{
                        _dataValues.push(`${columnsplit} = "${this.#sanitizestring(val)}"`)
                    }
                    
                }else{
                    _dataValues.push(`${column} = "${this.#sanitizestring(val)}"`)
                }   
            }
        }

        this.option['type'] = "update";
        this.option['values'] = "";
        this.option['table'] = table;
        this.option['columns'] = `${this.gloss.set} ${_dataValues.join(", ")}`
        return this;
    }

    /**
     * Rimuove valori nel db
     * @param {string} table - nome tabella  
     * es: 
     * ```js
     * query.delete("nometabella").query(...);
     * ```
     **/
    delete(table) {
        this.#initialize();
        this.option['type'] = "delete";
        this.option['values'] = "";
        this.option['from'] = `${this.gloss.from} ${table}`;
        return this;
    }


    /* funzioni di condizioni e altro */

    /**
     * Seleziona JOIN per la query
     * es: 
     * ```js
     * let joins={
     *          "nametable#type" :  { 'id tabella join': 'colonna tabella select' }, // '#' per type join
     *          "nametable#<" : { "id": 'idtabella' }, // < per LEFT JOIN or
     *          "nametable#>" : { "id": 'idtabella' }, // > per RIGHT JOIN or
     *          "nametable#<>" : { "id": 'idtabella' }, // <> per INNER JOIN or
     *          "nametable#><" : { "id": 'idtabella' }, // >< per CROSS JOIN
     *     ...};
     * query.join(joins);
     * ```
     * @param {object} joins - elenco JOIN  
     **/
    join(joins) {
        // console.log(this);
        let arrJoins = [];
        if (typeof joins === "object") {
            for (const [paramTable, paramColum] of Object.entries(joins)) {
                let tableJoin;
                let typeJoin;
                let strJoin;
                if (typeof paramTable === "string") {
                    let secParamTable = this.#DelSpace(paramTable)
                    /* Join type and table */
                    if (secParamTable.includes("#") && secParamTable.length > 1) {
                        let tabletype = secParamTable.split("#");
                        tableJoin = tabletype[0];
                        typeJoin = this.#getTypeJoin(tabletype[1]);
                        strJoin = `${typeJoin} ${this.gloss.join} ${tableJoin} ${this.gloss.on} `

                    } else {
                        this.msgError.push("Errore: manca type join")
                    }

                    if (typeof paramColum === "object") {
                        let whereJoin = [];
                        for (const [idTableSel, idTableJoin] of Object.entries(paramColum)) {
                            whereJoin.push(`${idTableSel} = ${tableJoin}.${idTableJoin} `)
                        }
                        strJoin += whereJoin.join(` ${this.gloss.and} `)
                    } else {
                        this.msgError.push("Errore: parametro where join non corretto")
                    }
                }
                arrJoins.push(strJoin);
            }
        } else {
            this.msgError.push("Errore: parametri join non corretti")
        }

        this.option['joins'] = arrJoins.join(" ");
        return this;
    }


    /**
     * Seleziona colonne per la query
     * @param {array} where - query 
     * es: 
     * ```js
     * let where={
     *           "AND": { 
     *                      "namefield1": '55',
     *                      "namefield2": '1'
     *              } // ritorna WHERE (namefield1 = 55 AND namefield2 = 1)
     *     };
     * let where={
     *           "AND": { 
     *                      "namefield1#<": '55',  inserirne l'operatore nel mome della colonna dopo #  es #< per maggiore di
     *                      "namefield2#>": '22',
     *                      "namefield3#!": '33',
     *                      "namefield4": [1,2,3]
     *              } // ritorna WHERE (namefield1 < 55 AND namefield2 > 22 AND namefield3 != 33 AND namefield4 IN (1,2,3))
     *     };
     * let where={
     *           "AND": { 
     *                      "namefield1": '55', 
     *                      setfunc: { "year": ['namefiled0'], "=": ["2022", "2021"] }, // uso delle funzioni
     *                      "namefiled2#>": { setfunc: ['year', 'fieldate'] }, // altro uso delle funzioni
     *              } // ritorna WHERE ( namefiled1 = 55 AND YEAR(namefiled0) IN (2022,2021)  AND namefiled2 > YEAR(fieldate) )
     *     };
     * let where={
     *      "AND": { 
     *           "or#primo": {  // per multi OR aggiungere un # seguito da qualsiasi valore
     *                          "namefield5": ['5', '9'], 
     *                          "namefield6": "7"
     *                     }, 
     *           "or#secondo": {  // per multi OR aggiungere un # seguito da qualsiasi valore
     *                          "namefield8": ['88', '90'], 
     *                          "namefield9": { setfunc: ["month", "73"] }
     *                     } 
     *     }; 
     *  } // ritorna WHERE (namefield5 IN (5,9) OR namefield6 = 7) AND (namefield8 IN (88,90) OR namefield9 = MONTH(73))'
     * 
     * query.where(where);
     * ```
     **/
    where(where) {
        let arraWhere = [];
        if (typeof where === "object") {
            for (const [key, value] of Object.entries(where)) {
                if (key.toLowerCase() === "and") {
                    arraWhere.push(this.#setAnd(value));
                }
                if (key.toLowerCase().slice(0, 2) === "or") {
                    arraWhere.push(this.#setOr(value));
                }
            }
        } else {
            this.msgError.push("Errore: parametri where non corretti")
        }
        this.option['where'] = `${this.gloss.where} ` + arraWhere.join(` ${this.gloss.and} `);
        return this;
    }


    /**
    * Seleziona ORDER per la query
    * es: 
    * ```js
    * let order= {
    *              "nome colonna": "ordine ASC, asc o a / DESC, desc o d", 
    *              "fiel01": "asc" 
    *              "fiel02": "d" 
    * } // ritorna 'ORDER BY fiel01 ASC, fiel02 DESC'
    * query.order(order);
    * ```
    * @param {object} order - colonne ordinamento  
    **/
    order(order) {
        if (!order) {
            this.msgError.push("Errore: mancano parametri Order")
            return this;
        }

        let arrayOrder = []
        if (typeof order === "object") {
            for (const [_column, _order] of Object.entries(order)) {
                let path = [];
                path.push(_column);
                path.push(this.#getOrder(_order.toLowerCase()));
                arrayOrder.push(path.join(" "))
            }
        }

        if (typeof order === "string") {
            let path = [];
            path.push(order);
            path.push(this.#getOrder("a"));
            arrayOrder.push(path.join(" "))
        }

        this.option['order'] = `${this.gloss.order} ${arrayOrder.join(", ")}`
        return this;
    }


    /**
    * Seleziona LIMIT per la query
    * es: 
    * ```js
    * //con string o int
    * let limit= 5// ritorna 'LIMIT 5'
    * //con array
    * let limit= [1,10] // ritorna 'LIMIT 1,10'
    * //con object
    * //possibilità di aggiungere pagination con key 'pag' per la pagina e 'row' per numero di elementi per pagina 
    * let limit=  { page: 2, row: 16 } // ritorna 'LIMIT 17,16'
    * query.limit(limit);
    * ```
    * @param {object} limit - colonne ordinamento  
    **/
    limit(limit) {
        if(this.onlyone){
            this.option['limit'] = `${this.gloss.limit} 1` ;
            return this;
        }
        if (!limit) {
            this.msgError.push("Errore: mancano parametri Order")
            return this;
        }

        let txtLimit;
        if (typeof limit === "object") {
            let page = ""
            let row = ""
            for (const [key, value] of Object.entries(limit)) {
                if (key === "page") {
                    page = value
                }
                if (key === "row") {
                    row = value
                }
            }
            let nlimit = [((page * row) - row) + 1, row];
            txtLimit = nlimit.join(", ");
        }

        if (Array.isArray(limit)) {
            txtLimit = limit.join(", ");
        }

        if (typeof limit === "string" || typeof limit === "number") {
            txtLimit = limit;
        }

        this.option['limit'] = `${this.gloss.limit} ${txtLimit}`;
        return this;
    }


    /**
     * Seleziona GROUP per la query
     * es: 
     * ```js
      * //con string 
     * let group= "nomecolomnna"// ritorna GROUP BY 'nomecolonna'
     * //con array
     * let group= ["nomecolomnna1","nomecolomnna2"] // 
     * // ritorna GROUP BY nomecolonna1, nomecolonna1
     * query.group(group);
     * ```
     * @param {object} group - colonne ragguppamento  
     **/
    group(group) {
        if (!group) {
            this.msgError.push("Errore: mancano parametri Group")
            return this;
        }
        let txtgroup;
        if (typeof group === "string") {
            txtgroup = group;
        }

        if (Array.isArray(group)) {
            txtgroup = group.join(", ");
        }

        this.option['group'] = `${this.gloss.group} ${txtgroup}`
        return this;
    }

    having(having) {
        this.option['having'] = having;
        return this;
    }

    raw(raw) {
        raw = `{(${raw})}`
        return raw;
    }

    /*private*/

    #initialize(){
        this.option = [];
        this.error =false;
        this.onlyone =false;
    }

    #getinsertvalue(row) {
        let columns = [], values = []
        if (typeof row === "object") {
            for (const [column, val] of Object.entries(row)) {
                columns.push(column)
                let nval = this.#sanitizestring(val)
                values.push(`"${nval}"`)
            }
        }
        let columnjoin = columns.join(", ")
        let valuejoin = values.join(", ")
        return { dataColumns: columnjoin, dataValues: valuejoin };
    }

    #sanitizestring(value){
        let nvalule = value
        if (typeof value === "string") {
            nvalule = value.replace(/"/g, '\\"')
        }
        return nvalule;
    }

    #checkPath(){
        let request=this.typeRequest[this.option.type.replace(/\s/g, '')];
        let errstate=false;
        let errmsg=[];
        for (const [key, val] of Object.entries(request)) {
            if(val && !this.option[key]){
                errstate=true;
                errmsg.push(`${this.option.type.toUpperCase()} richiede ${key}`)
            }
            if(!val && this.option[key]){
                errstate=true;
                errmsg.push(`${this.option.type.toUpperCase()} non richiede ${key}`)
            }
        }
        return {state: errstate,error:errmsg}
    }

    /* function sql*/
    #setfunctioncol(column) {
        //console.log(column)
        let result = {
            _column: "",
            _operator: "",
            _param: ""
        }
        let namefunction = Object.keys(column)[0];
        let param = Object.values(column)[0];
        if (!Array.isArray(param)) {
            this.msgError.push("Errore: parametro funzione non corretto")
            return "error";
        }
        let remod = { setfunc: [namefunction, ...param] };
        result._column = this.#setfunction(remod);
        result._operator = Object.keys(column)[1]
        result._param = Object.values(column)[1]
        return result;
    }

    #setfunction(column) {
        let resfunc;
        for (const [key, value] of Object.entries(column)) {
            if (key == "setfunc" && Array.isArray(value)) {
                let func = value[0].toUpperCase();
                /*aggiungere controllo ad elenco funzioni*/
                if (func === "") {
                    this.msgError.push("Errore: parametro funzione non corretto")
                    return "error";
                }
                let paramsel = [];
                let alias = "";
                value.shift();
                value.forEach((param) => {
                    if (typeof param === "string") {
                        if (!param.includes("#")) {
                            paramsel.push(param)
                        } else {
                            param = this.#DelSpecialChar(param)
                            if (param.length > 0)
                                alias = ` ${this.gloss.as} ${param}`;
                        }
                    }
                    if (this.#isFunction(param)) {
                        let setfunc = this.#setfunction(param);
                        paramsel.push(setfunc);
                    }
                })

                if (paramsel.filter(Boolean).length === 0) {
                    this.msgError.push("Errore: mancano parametri")
                    return "error";
                }
                resfunc = `${func}(${paramsel.join(", ")})${alias}`
            }
        }
        return resfunc
    }

    #isFunction(value) {
        if (typeof value === "object") {
            if (("setfunc" in value)) {
                return true;
            }
        }
        return false
    }

    #DelSpace(value) {
        if (typeof value == "string") {
            value = value.replace(/\s/g, '')
        }
        return value
    }
    #DelSpecialChar(value) {
        if (typeof value == "string") {
            value = value.replace(/^\d+|[^a-zA-Z0-9]/g, "")
        }
        return value
    }

    #getTypeJoin(simbol) {
        let type = {
            ">": "RIGHT",
            "<": "LEFT",
            "<>": "INNER",
            "><": "CROSS",
        }
        return type[simbol];
    }

    #getOperator(simbol) {
        let type = {
            "=": { valmin: 1, simbol: "=", isarray: "IN" },
            "!": { valmin: 1, simbol: "!=", isarray: "NOT IN" },
            "<": { valmin: 1, simbol: "<", isarray: "<" },
            "<=": { valmin: 1, simbol: "<=", isarray: "<=" },
            ">": { valmin: 1, simbol: ">", isarray: ">" },
            ">=": { valmin: 1, simbol: ">=", isarray: ">=" },
            "<>": { valmin: 2, simbol: "BETWEEN", isarray: "BETWEEN" },
            "><": { valmin: 2, simbol: "NOT BETWEEN", isarray: "NOT BETWEEN" },
            "@": { valmin: 2, simbol: "LIKE", isarray: "LIKE", theme: "%#%" },
            "@s": { valmin: 2, simbol: "LIKE", isarray: "LIKE", theme: "#%" },
            "@e": { valmin: 2, simbol: "LIKE", isarray: "LIKE", theme: "%#" },
            "setfunc": "isfunction"
        }
        return type[simbol];
    }

    #getOrder(simbol) {
        let type = {
            "a": "ASC",
            "d": "DESC",
            "asc": "ASC",
            "desc": "DESC",
        }
        return type[simbol];
    }

    #setAnd(and) {
        let resAnd = this.#setwhere(and)
        let andJoin = `(${resAnd.join(` ${this.gloss.and} `)})`
        //console.log(andJoin)
        return andJoin;
    }

    #setOr(or) {
        let resOr = this.#setwhere(or)
        let orJoin = `(${resOr.join(` ${this.gloss.or} `)})`
        //console.log(orJoin)
        return orJoin;

    }

    #setwhere(condition) {
        let resCondition = [];
        for (const [column, param] of Object.entries(condition)) {
            let path = {
                _column: "",
                _operator: "",
                _param: ""
            }
            let operator;
            if (column.toLowerCase() === "and") {
                resCondition.push(this.#setAnd(param))
                continue;
            }
            if (column.toLowerCase().slice(0, 2) === "or") {
                resCondition.push(this.#setOr(param))
                continue;
            }

            if (column.includes("#")) {
                let splitCol = column.split("#");
                operator = splitCol[1]
                path._column = this.#DelSpecialChar(splitCol[0]);

                if (this.#getOperator(operator)) {
                    path._operator = this.#getOperator(operator).simbol;
                } else {
                    this.msgError.push(`Errore: Operatore ${operator} inesistente`)
                    this.error = true;
                    operator = "=";
                    path._operator = "=";
                }

                if ("theme" in this.#getOperator(operator)) {
                    let themeParam = this.#getOperator(operator).theme.replace("#", param);
                    path._param = `"${themeParam}"`;
                } else {
                    path._param = `"${param}"`;
                }

            } else {
                path._column = this.#DelSpecialChar(column);
                path._operator = this.#getOperator("=").simbol;
                operator = "="
                path._param = `"${param}"`;
            }

            if (typeof param === "object") {
                let _operator = Object.keys(param)[0];
                if (this.#getOperator(column) === "isfunction") {
                    let resultFncCol = this.#setfunctioncol(param);
                    path._column = resultFncCol._column;
                    path._operator = resultFncCol._operator;
                    if (Array.isArray(resultFncCol._param)) {
                        let operarray = this.#getOperator(resultFncCol._operator).isarray
                        path._operator = ""
                        path._param = `${operarray} (${resultFncCol._param.join(',')})`
                    } else {
                        path._param = resultFncCol._param;
                    }
                }
                if (this.#getOperator(_operator) === "isfunction") {
                    path._param = this.#setfunction(param);
                }
            }

            if (Array.isArray(param)) {
                let operarray = this.#getOperator(operator).isarray
                path._operator = ""
                path._param = `${operarray} ("${param.join('","')}")`
            }

            // if (typeof param === "string") {
            //     path._operator = this.#getOperator("=").simbol;
            //     path._param = `"${param}"`;
            // }

            let path_value = Object.values(path)
            let pathjoin = path_value.filter(Boolean).join(" ");
            resCondition.push(pathjoin);
        }
        return resCondition;
    }
    /**
     * Aiuta a settare 'Object' per creare la query
     * es: 
     * ```js
     * option= new query.Optionquery();
     * var option={
     *          fields: {'name','surname},
     *          join: {[>]nametable: {id:idtabella}},
     *          where:{and:{namefield[!]:'value',namefield[>]:25}},
     *          order:{desc:namefield} 
     *     };
     * query.get("nametable",option);
     * ```
     * es 2: 
     * ```js
     * option= new query.Optionquery();
     * option.setfields({'name','surname'}).setjoin({'[>]table':{'id':'idtable'}}).setwhere({and:{'old[>]':25}}).setorder({'DESC':'name'})
     * query.get("nametable",option);
     * ```
     * @param {object} option - Opzioni di ricerca coma da esempio 
     * */
    Optionquery() {
        let query = {
            fields: "*",
            join: [],
            where: [],
            order: []
        }

        return query;
    }

    /* 
     *
     *
     * private function 
     * 
     * 
     * */

    #quotetable(table) {
        if (table) {
            if (table.match(/^[\p{L}_][\p{L}\p{N}@$#\-_]*$/u)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

}

module.exports = ak_jsquery;