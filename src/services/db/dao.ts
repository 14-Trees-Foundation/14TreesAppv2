
import { SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { UsersData } from './users';
import { PlotsData } from './plots';
import { UsersDao } from './users';

enablePromise(true);

let dbConnection: SQLiteDatabase;
const getDBConnection = async () => {
    if (!dbConnection) {
        dbConnection = await openDatabase({ name: '14trees.db', location: 'default' });
    }
    return dbConnection;
};

export class LocalDatabase {
    public users: UsersData;
    public plots: PlotsData;
    constructor(dbConnection: SQLiteDatabase) {
        this.users = new UsersData(dbConnection);
        this.plots = new PlotsData(dbConnection);
export class DaoClient {
    public users: UsersDao;

    constructor(dbConnection: SQLiteDatabase) {
        this.users = new UsersDao(dbConnection);
    }

    static async authenticate() {
        const connection = await getDBConnection();
        return new DaoClient(connection);
    }

    
}
