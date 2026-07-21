import React, { useState } from 'react';
import {
  View,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';

import { CrossIcon, PlusAddIcon } from '../../assets/svgs/SvgsFile';
import { fonts } from '../../utils/typography';
import AppText from '../../components/AppText/AppText';

interface Props {
  maxCount?: number;
  value: string[];
  onChange: (data: string[]) => void;
  placeHolder?: string;
  color?: string;
}

const DiscussionPoints = ({
  maxCount = 10,
  value,
  onChange,
  placeHolder,
  color
}: Props) => {
  const [text, setText] = useState('');

  const addPoint = () => {
    const trimmed = text.trim();

    if (!trimmed) {
      return;
    }

    if (value.length >= maxCount) {
      Alert.alert(
        `Maximum ${maxCount} discussion points allowed`,
      );
      return;
    }

    onChange([...value, trimmed]);

    setText('');
  };

  const removePoint = (index: number) => {
    onChange(
      value.filter((_, i) => i !== index),
    );
  };

  return (
    <View>
      {value.map((item, index) => (
        <View
          key={`${item}-${index}`}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: '#E5EAF1',
            paddingHorizontal: 16,
            paddingVertical: 14,
          }}
        >
          <View
            style={{
              width: 20,
              height: 20,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: color||'#EAF0FB',
            }}
          >
            <AppText
              size={10}
              family="InterBold"
              color="#1F447D"
            >
              {index + 1}
            </AppText>
          </View>

          <AppText
            style={{
              marginLeft: 16,
              flex: 1,
            }}
            family="InterBold"
            size={13}
          >
            {item}
          </AppText>

          <Pressable
            onPress={() =>
              removePoint(index)
            }
          >
            <CrossIcon
              color="rgba(0,0,0,0.5)"
              size={16}
            />
          </Pressable>
        </View>
      ))}

      <View
        style={{
          backgroundColor: '#F3F3F4',
          paddingHorizontal: 14,
          paddingVertical: 10,
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <TextInput
          value={text}
          onChangeText={setText}
          placeholder={placeHolder || "Add discussion point..."}
          placeholderTextColor={'rgba(0,0,0,0.4)'}
          style={{
            flex: 1,
            height: 40,
            backgroundColor: '#E4EAF5',
            borderRadius: 10,
            paddingHorizontal: 12,
            color: '#000',
            fontFamily: fonts.InterBold,
            fontSize: 13,
          }}
        />

        <Pressable
          onPress={addPoint}
          style={{
            height: 35,
            borderRadius: 10,
            backgroundColor: '#1A3A6B',
            paddingHorizontal: 12,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <PlusAddIcon
            size={12}
            color="#fff"
          />

          <AppText
            color="#fff"
            family="InterBold"
            size={12}
            style={{
              marginLeft: 6,
            }}
          >
            Add
          </AppText>
        </Pressable>

        <AppText
          size={12}
          family="InterBold"
          color="rgba(0,0,0,0.5)"
        >
          {value.length}/{maxCount}
        </AppText>
      </View>
    </View>
  );
};

export default DiscussionPoints;