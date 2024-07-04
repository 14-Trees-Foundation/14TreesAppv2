import { SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { UsersData } from './users';

enablePromise(true);

let dbConnection: SQLiteDatabase;
const getDBConnection = async () => {
    if (!dbConnection) {
        dbConnection = await openDatabase({ name: 'tree.db', location: 'default' });
    }
    return dbConnection;
};

getDBConnection();

export class LocalDatabase {
    private db: SQLiteDatabase;
    public users: UsersData;

    constructor() {
        this.db = dbConnection;
        this.users = new UsersData(dbConnection);
        this.users.createTable();
    }
}

