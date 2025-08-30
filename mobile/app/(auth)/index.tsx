import { useSocialAuth } from "@/hooks/useSocialAuth";
import { Text, View, Image, TouchableOpacity, ActivityIndicator} from "react-native";

export default function Index() {

  const {isLoading,handleSocialAuth} = useSocialAuth();

  return (
    <View className="flex-1 bg-white">
      <View className="flex-1 px-8 justify-between">
        <View className="flex-1 justify-center">

          {/* Demo Image */}
          <View className=" items-center">
            <Image source={require("../../assets/images/auth1.png")} className="size-96" resizeMode="contain"/>
          </View>
          
          <View className="flex-col gap-2">

             {/* For Google */}
             <TouchableOpacity 
              className="flex-row items-center p-1 justify-center bg-white border border-gray-300 rounded-full px-3 px-6"
              onPress={()=>{handleSocialAuth('oauth_google')}}
              disabled={isLoading}
              style={{
                
              }}
              >
              <View className="flex-row items-center justify-center">
                {
                  isLoading ? (
                    <ActivityIndicator size="small" color="#000"/>
                  ) : (
                    <View className="flex-row items-center">
                      <Image 
                        source={require("../../assets/images/google.png")}
                        className="size-10 mr-3"
                        resizeMode="contain"
                      />
                      <Text className=" text-black font-medium text-base">Continue with Google</Text>
                    </View>
                  )
                }
              </View>
             </TouchableOpacity>

              {/* For Apple */}
             <TouchableOpacity 
              className="flex-row items-center p-1 py-2 justify-center bg-white border border-gray-300 rounded-full px-3 px-6"
              onPress={()=>{handleSocialAuth("oauth_apple")}}
              disabled={isLoading}
              style={{
                
              }}
              >
              <View className="flex-row items-center justify-center">
                {
                  isLoading ? (
                    <ActivityIndicator size="small" color="#000"/>
                  ) : (
                    <View className="flex-row items-center">
                      <Image 
                        source={require("../../assets/images/apple.png")}
                        className="size-8 mr-3"
                        resizeMode="contain"
                      />
                      <Text className=" text-black font-medium text-base">Continue with Apple</Text>
                    </View>
                  )
                }
              </View>
             </TouchableOpacity>
          </View>

          {/* Terms and Privacy */}
          <Text className="text-center text-gray-500 text-xs leading-4 mt-6 px-2">
                By signing up, you agree to our <Text className=" text-blue-500">Terms</Text>
                {", "}
                <Text className="text-blue-500">Privacy Policy</Text>
                {" and "}
                <Text className="text-blue-500">Cookie Use</Text>
          </Text>
        </View>
      </View>
    </View>
  );
}
