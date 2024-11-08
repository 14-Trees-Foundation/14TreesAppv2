import React, { useState } from 'react';
import { ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { Card, IconButton, Text } from 'react-native-paper';
import ImageView from "react-native-image-viewing";
import { ImageSource } from '../model/common';

interface ImagesViewInputProps {
  title: string;
  images: (string | ImageSource)[];
  onDelete?: (index: number) => void
}

const ImagesView: React.FC<ImagesViewInputProps> = ({ title, images, onDelete }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleImageClick = (index: number) => {
    setCurrentIndex(index);
    setIsVisible(true);
  }

  return (
    <View style={styles.container}>
        <Text>{title}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
            {images.map((image, index) => (
            <TouchableOpacity key={index} onPress={() => handleImageClick(index)} activeOpacity={0.9}>
              <Card style={styles.card}>
                <Card.Cover source={{ uri: typeof image === 'string' ? image : image.uri }} defaultSource={require('../../assets/placeholder.png')} style={styles.cardCover} />
                { onDelete !== undefined && typeof image !== 'string' && 
                  <IconButton
                    icon="close"
                    size={15}
                    style={styles.deleteIcon}
                    onPress={() => onDelete(index)}
                  /> 
                }
                {typeof image !== 'string' && image.description && <Card.Content><Text>{image.description}</Text></Card.Content>}
              </Card>
            </TouchableOpacity>
            ))}
        </ScrollView>

        <ImageView
          images={images.map(image =>({uri: typeof image === 'string' ? image : image.uri}))}
          imageIndex={currentIndex}
          visible={isVisible}
          onRequestClose={() => setIsVisible(false)}
          FooterComponent={(props) => ( <Text style={{ textAlign: 'center', color: 'white' }}>{(props.imageIndex + 1) + "/" + images.length}</Text> )}
          keyExtractor={(src, index) => index.toString()}
        />
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
  deleteIcon: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: 'white',
  },
});

export default ImagesView;
