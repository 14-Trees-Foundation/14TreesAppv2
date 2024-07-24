import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';

interface ImagesViewInputProps {
    title: string
    images: string[]
}

const ImagesView: React.FC<ImagesViewInputProps> = ({ title, images }) => {
  return (
    <View style={styles.container}>
        <Text>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            {images.map((image, index) => (
              <Card key={index} style={styles.card}>
                  <Card.Cover source={{ uri: image }} style={styles.cardCover} />
              </Card>
            ))}
        </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 5,
  },
  scrollContainer: {
    paddingVertical: 10,
  },
  card: {
    marginRight: 16,
    width: 200,
  },
  cardCover: {
    height: 200,
  },
});

export default ImagesView;
