export const TIPS_CONFIG = {
    //非WIFI
    NOT_WIFI: {                                                         
        ok_text: "Continue",                                            //继续播放按钮文案
        cancel_text: "Cancel",                                          //取消按钮文案
        title: "You are using cellular network.",                       //标题
        content: "Are you sure you want to continue downloading without using Wi-Fi?",       //内容
    },
    //无网络
    NO_NETWORK: {                                                   
        ok_text: "Try Again",                                         
        cancel_text: "Cancel",                                        
        title: "Network connection failed. ",      
        content: "Oops, There is no network. Please check your network settings.",
    },
    //下载失败
    DOWNLOAD_FAILED: {
        ok_text: "Try Again",                                          
        cancel_text: "Cancel",                                        
        title: "Data download failed",      
        content: "Please check if your phone is connected to the internet.",   
    },
    
    //接口请求失败
    REQUEST_FAILED: {
        ok_text: "Try Again",                                        
        cancel_text: "Cancel",                                        
        title: "The server is abnormal. Please try again later.",     
        content: "",    
    },

    //获取游戏配置错误
    GET_GAME_CONFIG_ERR: {
        ok_text: "OK",
        cancel_text: "Cancel",
        title: "File configuration error",
        content: "Get file configuration error，please back and try again.",
    },

    PERMISS_ALERT: {
        ok_text: "Setting",
        cancel_text: "Cancel",
        title: "",
        content: "Ace Early Learning app needs your permission to access microphone for speech recognition!",
    }
}