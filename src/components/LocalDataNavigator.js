import { createStackNavigator } from "@react-navigation/stack";
import { Strings } from "../services/Strings";
import LocalDataView from "../screens/LocalDataView";
import { EditLocalTree } from "../screens/EditLocalTree";

const Stack = createStackNavigator();

export const LocalDataNavigator = (props) =>
(
    <Stack.Navigator>
        <Stack.Screen
            name={Strings.screenNames.getString('LocalDataView', Strings.english)}
            component={LocalDataView}
            options={{
                headerShown: false,
            }} />
        <Stack.Screen
            name={Strings.screenNames.getString('EditLocalTree', Strings.english)}
            component={EditLocalTree}
            options={{
                headerShown: false,
            }} />
    </Stack.Navigator>
);