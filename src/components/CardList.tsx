import { FC } from "react";
import { FlatList, StyleSheet, View } from "react-native";
import { ActivityIndicator, Text } from "react-native-paper";

interface CardListProps {
    data: any[]
    renderItem: (item: any, index: number) => JSX.Element
    pagination?: boolean
    onEndReached?: () => void
    hasMore?: boolean
}

const CardList: FC<CardListProps> = ({ data, renderItem, pagination, onEndReached, hasMore }) => {

    const renderFooter = () => {
        if (!pagination) {
            return undefined;
        }

        return (
            <View style={styles.paginationContainer}>
                {hasMore && <ActivityIndicator />}
                {!hasMore && <Text>No more data</Text>}
            </View>
        )
    }

    return (
        <FlatList 
            keyboardShouldPersistTaps={'handled'}
            style = {{ flex: 1, width: '100%' }}
            data={data}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => renderItem(item, index)}
            ListFooterComponent={renderFooter}
            onEndReachedThreshold={pagination ? 0.2 : undefined}
            onEndReached={pagination && hasMore && onEndReached ? onEndReached : undefined}
        />
    )
}

const styles = StyleSheet.create({
    paginationContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 10
    }
})

export default CardList;