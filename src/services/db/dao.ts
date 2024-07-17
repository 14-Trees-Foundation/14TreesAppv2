
import { SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { UsersDao } from './users';
import { SitesDao } from './sites';

enablePromise(true);

let dbConnection: SQLiteDatabase;
const getDBConnection = async () => {
    if (!dbConnection) {
        dbConnection = await openDatabase({ name: '14trees.db', location: 'default' });
    }
    return dbConnection;
};

export class DaoClient {
    public users: UsersDao;
    public sites: SitesDao;

    constructor(dbConnection: SQLiteDatabase) {
        this.users = new UsersDao(dbConnection);
        this.sites = new SitesDao(dbConnection);
    }

    static async authenticate() {
        const connection = await getDBConnection();
        return new DaoClient(connection);
    }
}
