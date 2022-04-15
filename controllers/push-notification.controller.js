const {ONE_SIGNAL_CONFIG} = require("../config/pushNotification_config");
const pushNotificationService = require("../services/push_Notification.services");

exports.SendNotification = (req,res,next) =>{
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents:{"en":"비뇨기과 공지사항!!!!"},
        included_segments:["All"],
        content_avaliable:true,
        small_icon:"ic_notification_icon",
        data:{
            PushTitle:"CUSTOM NOTIFICATION"
        }
    };

    pushNotificationService.sendNotification(message,(error,results)=>{
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message:"Success",
            data:results
        })
    })
}

//특정 기기에 전달
exports.SendNotificationToDevice = (req,res,next) =>{
    var message = {
        app_id: ONE_SIGNAL_CONFIG.APP_ID,
        contents:{"en":"test push"},
        included_segments:["included_player_ids"],
        include_player_ids:req.body.devices,
        content_avaliable:true,
        small_icon:"ic_notification_icon",
        data:{
            PushTitle:"CUSTOM NOTIFICATION"
        }
    };

    pushNotificationService.sendNotification(message,(error,results)=>{
        if(error){
            return next(error);
        }
        return res.status(200).send({
            message:"Success",
            data:results
        })
    })
};
