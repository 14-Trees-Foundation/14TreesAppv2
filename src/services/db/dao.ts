import { SQLiteDatabase, enablePromise, openDatabase } from 'react-native-sqlite-storage';
import { TreesDao } from './trees';
import { UsersDao } from './users';
import { TreeImagesDao } from './tree_images';
import { VisitsDao } from './visits';

enablePromise(true);

let dbConnection: SQLiteDatabase;
const getDBConnection = async () => {
    if (!dbConnection) {
        dbConnection = await openDatabase({ name: '14trees.db', location: 'default' });
    }
    return dbConnection;
};

export class DaoClient {
    public trees: TreesDao;
    public users: UsersDao;
    public treeImages: TreeImagesDao;
    public visits: VisitsDao;

    constructor(dbConnection: SQLiteDatabase) {
        this.trees = new TreesDao(dbConnection);
        this.users = new UsersDao(dbConnection);
        this.treeImages = new TreeImagesDao(dbConnection);
        this.visits = new VisitsDao(dbConnection);
    }

    static async authenticate() {
        const connection = await getDBConnection();
        return new DaoClient(connection);
    }
}