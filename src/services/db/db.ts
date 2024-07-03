import { SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { UsersData } from './users';

enablePromise(true);

export class LocalDatabase {
    private db: SQLiteDatabase | null = null;
    public users: UsersData | null = null;

    constructor() {
        this.getDBConnection().then((db) => {
            this.db = db;
            this.users = new UsersData(db);
        });
    }

    getDBConnection = async () => {
        if (!this.db) {
            return await openDatabase({ name: 'tree.db', location: 'default' });
        }
        return this.db;
    };
}

