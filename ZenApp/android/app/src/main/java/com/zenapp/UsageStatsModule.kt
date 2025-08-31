package com.zenapp

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.provider.Settings
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.*
import java.util.*

class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        const val CHANNEL_ID = "zen_app_notifications"
        const val NOTIFICATION_ID_WARNING = 1001
        const val NOTIFICATION_ID_EXCEEDED = 1002
    }

    override fun getName(): String {
        return "UsageStatsModule"
    }

    init {
        createNotificationChannel()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val name = "Zen App Notifications"
            val descriptionText = "Thông báo nhắc nhở về thời gian sử dụng điện thoại"
            val importance = NotificationManager.IMPORTANCE_HIGH
            val channel = NotificationChannel(CHANNEL_ID, name, importance).apply {
                description = descriptionText
            }

            val notificationManager: NotificationManager =
                reactApplicationContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            notificationManager.createNotificationChannel(channel)
        }
    }

    @ReactMethod
    fun getTodayUsage(promise: Promise) {
        try {
            val context = reactApplicationContext
            val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            // Lấy thời gian từ đầu ngày hôm nay
            val calendar = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            val startTime = calendar.timeInMillis
            val endTime = System.currentTimeMillis()

            val usageStatsList = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            var totalTimeInForeground = 0L
            for (usageStats in usageStatsList) {
                totalTimeInForeground += usageStats.totalTimeInForeground
            }

            // Chuyển đổi từ milliseconds sang giờ và phút
            val hours = totalTimeInForeground / (1000 * 60 * 60)
            val minutes = (totalTimeInForeground % (1000 * 60 * 60)) / (1000 * 60)

            val result = WritableNativeMap().apply {
                putInt("hours", hours.toInt())
                putInt("minutes", minutes.toInt())
                putDouble("totalMinutes", totalTimeInForeground / (1000.0 * 60))
                putString("date", java.text.DateFormat.getDateInstance().format(Date()))
            }

            promise.resolve(result)
        } catch (e: Exception) {
            promise.reject("USAGE_STATS_ERROR", "Không thể lấy thông tin sử dụng: ${e.message}")
        }
    }

    @ReactMethod
    fun openUsageAccessSettings(promise: Promise) {
        try {
            val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactApplicationContext.startActivity(intent)
            promise.resolve("Settings opened")
        } catch (e: Exception) {
            promise.reject("SETTINGS_ERROR", "Không thể mở cài đặt: ${e.message}")
        }
    }

    @ReactMethod
    fun checkUsagePermission(promise: Promise) {
        try {
            val context = reactApplicationContext
            val usageStatsManager = context.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

            val time = System.currentTimeMillis()
            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                time - 1000 * 10,
                time
            )

            val hasPermission = stats != null && stats.isNotEmpty()
            promise.resolve(hasPermission)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun showWarningNotification(title: String, message: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            }

            val pendingIntent: PendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                } else {
                    PendingIntent.FLAG_UPDATE_CURRENT
                }
            )

            val builder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .setStyle(NotificationCompat.BigTextStyle().bigText(message))

            with(NotificationManagerCompat.from(context)) {
                notify(NOTIFICATION_ID_WARNING, builder.build())
            }

            promise.resolve("Notification sent")
        } catch (e: Exception) {
            promise.reject("NOTIFICATION_ERROR", "Không thể gửi thông báo: ${e.message}")
        }
    }

    @ReactMethod
    fun showExceededNotification(title: String, message: String, promise: Promise) {
        try {
            val context = reactApplicationContext
            val intent = Intent(context, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            }

            val pendingIntent: PendingIntent = PendingIntent.getActivity(
                context, 0, intent,
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
                } else {
                    PendingIntent.FLAG_UPDATE_CURRENT
                }
            )

            val builder = NotificationCompat.Builder(context, CHANNEL_ID)
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setContentTitle(title)
                .setContentText(message)
                .setPriority(NotificationCompat.PRIORITY_MAX)
                .setContentIntent(pendingIntent)
                .setAutoCancel(true)
                .setStyle(NotificationCompat.BigTextStyle().bigText(message))
                .setVibrate(longArrayOf(0, 500, 200, 500))

            with(NotificationManagerCompat.from(context)) {
                notify(NOTIFICATION_ID_EXCEEDED, builder.build())
            }

            promise.resolve("Notification sent")
        } catch (e: Exception) {
            promise.reject("NOTIFICATION_ERROR", "Không thể gửi thông báo: ${e.message}")
        }
    }

    @ReactMethod
    fun cancelNotifications(promise: Promise) {
        try {
            val context = reactApplicationContext
            with(NotificationManagerCompat.from(context)) {
                cancel(NOTIFICATION_ID_WARNING)
                cancel(NOTIFICATION_ID_EXCEEDED)
            }
            promise.resolve("Notifications cancelled")
        } catch (e: Exception) {
            promise.reject("NOTIFICATION_ERROR", "Không thể hủy thông báo: ${e.message}")
        }
    }

    @ReactMethod
    fun startSmartInterventionService(promise: Promise) {
        try {
            val context = reactApplicationContext
            val intent = Intent(context, SmartInterventionService::class.java)

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }

            promise.resolve("Service started")
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", "Không thể khởi động service: ${e.message}")
        }
    }

    @ReactMethod
    fun stopSmartInterventionService(promise: Promise) {
        try {
            val context = reactApplicationContext
            val intent = Intent(context, SmartInterventionService::class.java)
            context.stopService(intent)
            promise.resolve("Service stopped")
        } catch (e: Exception) {
            promise.reject("SERVICE_ERROR", "Không thể dừng service: ${e.message}")
        }
    }

    @ReactMethod
    fun saveGoalToNative(hours: Int, minutes: Int, promise: Promise) {
        try {
            val sharedPrefs = reactApplicationContext.getSharedPreferences("zen_goals", Context.MODE_PRIVATE)
            val totalMinutes = hours * 60 + minutes
            sharedPrefs.edit().putInt("daily_goal_minutes", totalMinutes).apply()
            promise.resolve("Goal saved")
        } catch (e: Exception) {
            promise.reject("SAVE_ERROR", "Không thể lưu mục tiêu: ${e.message}")
        }
    }
}