package com.zenapp

import android.app.*
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import androidx.core.app.NotificationCompat
import java.util.*

class SmartInterventionService : Service() {

    companion object {
        const val CHANNEL_ID = "zen_intervention_channel"
        const val NOTIFICATION_ID_SERVICE = 2001
        const val NOTIFICATION_ID_CONTINUOUS = 2002
        const val NOTIFICATION_ID_NIGHT = 2003
        const val NOTIFICATION_ID_MORNING = 2004
        const val NOTIFICATION_ID_ACHIEVEMENT = 2005

        const val CHECK_INTERVAL = 5 * 60 * 1000L // 5 minutes
        const val CONTINUOUS_USE_THRESHOLD = 60 * 60 * 1000L // 60 minutes
        const val NIGHT_TIME_HOUR = 23 // 11 PM
        const val MORNING_START_HOUR = 6 // 6 AM
        const val MORNING_END_HOUR = 9 // 9 AM
    }

    private val handler = Handler(Looper.getMainLooper())
    private var lastActiveTime: Long = System.currentTimeMillis()
    private var continuousUseStartTime: Long = System.currentTimeMillis()
    private var hasShownMorningGreeting = false
    private var hasShownNightReminder = false
    private var lastScreenOnTime: Long = System.currentTimeMillis()

    private val checkRunnable = object : Runnable {
        override fun run() {
            performSmartInterventions()
            handler.postDelayed(this, CHECK_INTERVAL)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        startForegroundService()
        resetDailyFlags()
        handler.post(checkRunnable)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onDestroy() {
        super.onDestroy()
        handler.removeCallbacks(checkRunnable)
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Zen Smart Interventions"
            val descriptionText = "Can thiệp thông minh để quản lý thời gian sử dụng"
            val importance = NotificationManager.IMPORTANCE_LOW
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
                setShowBadge(false)
            }

            val notificationManager: NotificationManager =
                getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    private fun startForegroundService() {
        val notification = NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Zen đang theo dõi")
            .setContentText("Giúp bạn cân bằng cuộc sống số")
            .setSmallIcon(android.R.drawable.ic_menu_manage)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .build()

        startForeground(NOTIFICATION_ID_SERVICE, notification)
    }

    private fun performSmartInterventions() {
        val currentTime = System.currentTimeMillis()
        val calendar = Calendar.getInstance()
        val currentHour = calendar.get(Calendar.HOUR_OF_DAY)

        // Check continuous usage
        checkContinuousUsage(currentTime)

        // Morning greeting (6 AM - 9 AM)
        if (currentHour in MORNING_START_HOUR until MORNING_END_HOUR && !hasShownMorningGreeting) {
            sendMorningGreeting()
            hasShownMorningGreeting = true
        }

        // Night reminder (after 11 PM)
        if (currentHour >= NIGHT_TIME_HOUR && !hasShownNightReminder) {
            if (isPhoneInUse()) {
                sendNightReminder()
                hasShownNightReminder = true
            }
        }

        // Check daily achievement
        checkDailyAchievement()

        // Reset flags at midnight
        if (currentHour == 0 && calendar.get(Calendar.MINUTE) < 5) {
            resetDailyFlags()
        }
    }

    private fun checkContinuousUsage(currentTime: Long) {
        if (isPhoneInUse()) {
            val continuousTime = currentTime - continuousUseStartTime

            if (continuousTime >= CONTINUOUS_USE_THRESHOLD) {
                sendBreakReminder()
                // Reset timer after sending reminder
                continuousUseStartTime = currentTime
            }
        } else {
            // Reset continuous use timer if phone is not in use
            continuousUseStartTime = currentTime
        }
    }

    private fun isPhoneInUse(): Boolean {
        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val currentTime = System.currentTimeMillis()
        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            currentTime - 5 * 60 * 1000, // Last 5 minutes
            currentTime
        )

        return stats.isNotEmpty() && stats.any {
            it.lastTimeUsed > currentTime - 5 * 60 * 1000
        }
    }

    private fun sendBreakReminder() {
        val messages = listOf(
            "🧘 Bạn đã dùng điện thoại liên tục 1 giờ rồi! Hãy nghỉ ngơi 5 phút cho mắt nhé!",
            "☕ Thời gian nghỉ giải lao! Đứng dậy vận động và uống nước nào!",
            "👀 Mắt bạn cần được nghỉ ngơi. Hãy nhìn xa hoặc nhắm mắt 2 phút!",
            "🌿 1 giờ trôi qua rồi! Hãy để điện thoại xuống và thư giãn chút nhé!"
        )

        val message = messages.random()

        showNotification(
            NOTIFICATION_ID_CONTINUOUS,
            "⏰ Nhắc nhở nghỉ giải lao",
            message,
            NotificationCompat.PRIORITY_HIGH,
            true
        )
    }

    private fun sendMorningGreeting() {
        val tips = listOf(
            "💡 Mẹo: Để điện thoại xa giường ngủ giúp bạn ngủ ngon và dậy sớm hơn!",
            "💡 Mẹo: Bắt đầu ngày mới bằng 10 phút thiền thay vì lướt mạng xã hội!",
            "💡 Mẹo: Đặt chế độ Im lặng khi làm việc để tập trung tốt hơn!",
            "💡 Mẹo: Dùng quy tắc 20-20-20: Sau 20 phút nhìn màn hình, nhìn xa 20 feet trong 20 giây!"
        )

        val tip = tips.random()
        val message = "Chào buổi sáng! Chúc bạn một ngày tràn đầy năng lượng! $tip"

        showNotification(
            NOTIFICATION_ID_MORNING,
            "🌅 Chào ngày mới!",
            message,
            NotificationCompat.PRIORITY_DEFAULT,
            false
        )
    }

    private fun sendNightReminder() {
        val messages = listOf(
            "🌙 Đã muộn rồi! Ánh sáng xanh từ điện thoại có thể làm bạn khó ngủ. Hãy chuẩn bị đi nghỉ nhé!",
            "😴 11 giờ đêm rồi! Để có giấc ngủ ngon, hãy tắt điện thoại 30 phút trước khi ngủ!",
            "🛌 Cơ thể bạn cần nghỉ ngơi. Hãy để điện thoại sang một bên và thư giãn!",
            "⭐ Ban đêm là lúc não bộ phục hồi. Hãy cho bản thân một giấc ngủ chất lượng!"
        )

        val message = messages.random()

        showNotification(
            NOTIFICATION_ID_NIGHT,
            "🌙 Nhắc nhở giờ ngủ",
            message,
            NotificationCompat.PRIORITY_HIGH,
            true
        )
    }

    private fun checkDailyAchievement() {
        val sharedPrefs = getSharedPreferences("zen_goals", Context.MODE_PRIVATE)
        val goalMinutes = sharedPrefs.getInt("daily_goal_minutes", 0)

        if (goalMinutes > 0) {
            val todayUsageMinutes = getTodayUsageMinutes()

            // Check if user achieved goal (stayed under limit)
            val calendar = Calendar.getInstance()
            val hour = calendar.get(Calendar.HOUR_OF_DAY)

            // Check at 9 PM if goal was achieved
            if (hour == 21 && !sharedPrefs.getBoolean("achievement_shown_today", false)) {
                if (todayUsageMinutes < goalMinutes) {
                    sendAchievementNotification(todayUsageMinutes, goalMinutes)
                    sharedPrefs.edit().putBoolean("achievement_shown_today", true).apply()
                }
            }
        }
    }

    private fun getTodayUsageMinutes(): Int {
        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

        val calendar = Calendar.getInstance().apply {
            set(Calendar.HOUR_OF_DAY, 0)
            set(Calendar.MINUTE, 0)
            set(Calendar.SECOND, 0)
            set(Calendar.MILLISECOND, 0)
        }

        val startTime = calendar.timeInMillis
        val endTime = System.currentTimeMillis()

        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            startTime,
            endTime
        )

        var totalTime = 0L
        stats.forEach { totalTime += it.totalTimeInForeground }

        return (totalTime / (1000 * 60)).toInt()
    }

    private fun sendAchievementNotification(usedMinutes: Int, goalMinutes: Int) {
        val hours = usedMinutes / 60
        val minutes = usedMinutes % 60
        val goalHours = goalMinutes / 60
        val goalMins = goalMinutes % 60

        val message = "🎉 Tuyệt vời! Bạn đã giữ được mục tiêu hôm nay! " +
                "Chỉ dùng ${hours}h ${minutes}p / mục tiêu ${goalHours}h ${goalMins}p. " +
                "Hãy tiếp tục duy trì nhé! 💪"

        showNotification(
            NOTIFICATION_ID_ACHIEVEMENT,
            "🏆 Chúc mừng!",
            message,
            NotificationCompat.PRIORITY_HIGH,
            false
        )
    }

    private fun showNotification(
        id: Int,
        title: String,
        message: String,
        priority: Int,
        vibrate: Boolean
    ) {
        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }

        val pendingIntent: PendingIntent = PendingIntent.getActivity(
            this, 0, intent,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            } else {
                PendingIntent.FLAG_UPDATE_CURRENT
            }
        )

        val builder = NotificationCompat.Builder(this, CHANNEL_ID)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle(title)
            .setContentText(message)
            .setPriority(priority)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))

        if (vibrate) {
            builder.setVibrate(longArrayOf(0, 500, 200, 500))
        }

        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        notificationManager.notify(id, builder.build())
    }

    private fun resetDailyFlags() {
        hasShownMorningGreeting = false
        hasShownNightReminder = false

        val sharedPrefs = getSharedPreferences("zen_goals", Context.MODE_PRIVATE)
        sharedPrefs.edit().putBoolean("achievement_shown_today", false).apply()
    }
}