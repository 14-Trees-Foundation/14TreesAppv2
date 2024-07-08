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

export class LocalDatabase {
    private db: SQLiteDatabase;
    public users: UsersData;

    constructor(dbConnection: SQLiteDatabase) {
        this.db = dbConnection;
        this.users = new UsersData(dbConnection);
    }

    static async authenticate() {
        const connection = await getDBConnection();
        return new LocalDatabase(connection);
    }
}
