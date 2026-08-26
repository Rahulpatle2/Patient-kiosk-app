import { Dimensions } from 'react-native'

const { width, height } = Dimensions.get('window')

const BASE_WIDTH = 1920
const BASE_HEIGHT = 1081

export const scale = (size) => (width / BASE_WIDTH) * size
export const verticalScale = (size) => (height / BASE_HEIGHT) * size

export const dimensions = {
  screenWidth: width,
  screenHeight: height,
  isLandscape: width > height,
}