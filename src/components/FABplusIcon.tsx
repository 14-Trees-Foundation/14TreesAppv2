import React from "react";
import { StyleSheet } from "react-native";
import { FAB } from "react-native-paper";

interface AddIconButtonInputProps {
    onClick: () => void
}

export const AddIconButton: React.FC<AddIconButtonInputProps> = ({ onClick }) => {

    return (
        <FAB
            icon="plus"
            style={styles.fab}
            onPress={onClick}
        />
    )
}

const styles = StyleSheet.create({
    fab: {
      position: 'absolute',
      backgroundColor: '#90EE90',
      margin: 16,
      right: 0,
      bottom: 0,
    },
})