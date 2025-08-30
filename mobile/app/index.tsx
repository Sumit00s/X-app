import { View, Text, Button} from 'react-native'
import React from 'react'
import { useClerk, useUser } from '@clerk/clerk-expo'

const index = () => {

  const {signOut} = useClerk();

  const {user} = useUser();

  return (
    <View>
      <Text>Home Screen</Text>
      <Button onPress={()=>signOut} title={'Logout'}></Button>
    </View>
  )
}

export default index