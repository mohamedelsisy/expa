import java.util.Properties

plugins {
    id("com.android.application")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

// Release signing material is NEVER committed. Provide either android/key.properties
// (storeFile, storePassword, keyAlias, keyPassword) or the environment variables
// EXPA_KEYSTORE_FILE, EXPA_KEYSTORE_PASSWORD, EXPA_KEY_ALIAS, EXPA_KEY_PASSWORD (CI).
// See docs/MOBILE_SETUP.md.
val keyProps = Properties().apply {
    val f = rootProject.file("key.properties")
    if (f.exists()) f.inputStream().use { load(it) }
}

fun signingValue(propName: String, envName: String): String? =
    (keyProps.getProperty(propName) ?: System.getenv(envName))?.takeIf { it.isNotBlank() }

val releaseStoreFile = signingValue("storeFile", "EXPA_KEYSTORE_FILE")
val releaseStorePassword = signingValue("storePassword", "EXPA_KEYSTORE_PASSWORD")
val releaseKeyAlias = signingValue("keyAlias", "EXPA_KEY_ALIAS")
val releaseKeyPassword = signingValue("keyPassword", "EXPA_KEY_PASSWORD")
val hasReleaseSigning = listOf(releaseStoreFile, releaseStorePassword, releaseKeyAlias, releaseKeyPassword).all { it != null }

android {
    // PLACEHOLDER IDENTITY: the final application id is an owner decision (it must match the Play listing
    // and can never change after publishing). Kept identical to the iOS bundle id.
    namespace = "it.expa.app"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    defaultConfig {
        applicationId = "it.expa.app"
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
        // Host used for https App Links (verified links need /.well-known/assetlinks.json on this host).
        // `.invalid` is a reserved TLD: until the owner passes -PexpaLinkHost=<real web host> no link can match.
        manifestPlaceholders["expaLinkHost"] = (project.findProperty("expaLinkHost") as String?) ?: "app-links.expa.invalid"
    }

    signingConfigs {
        if (hasReleaseSigning) {
            create("release") {
                storeFile = rootProject.file(releaseStoreFile!!)
                storePassword = releaseStorePassword
                keyAlias = releaseKeyAlias
                keyPassword = releaseKeyPassword
            }
        }
    }

    buildTypes {
        release {
            // Never the debug key. Without signing material the build is refused below.
            if (hasReleaseSigning) signingConfig = signingConfigs.getByName("release")
            isMinifyEnabled = true
            isShrinkResources = true
        }
    }
}

// Fail loudly (instead of silently producing a debug-signed or unsigned release).
gradle.taskGraph.whenReady {
    val releaseBuild = allTasks.any {
        val n = it.name
        (n.startsWith("assemble") || n.startsWith("bundle") || n.startsWith("package")) && n.endsWith("Release")
    }
    if (releaseBuild && !hasReleaseSigning) {
        throw GradleException(
            "EXPA release signing is not configured. Create android/key.properties " +
                "(storeFile, storePassword, keyAlias, keyPassword) or set EXPA_KEYSTORE_FILE, " +
                "EXPA_KEYSTORE_PASSWORD, EXPA_KEY_ALIAS, EXPA_KEY_PASSWORD. See docs/MOBILE_SETUP.md."
        )
    }
}

kotlin {
    compilerOptions {
        jvmTarget = org.jetbrains.kotlin.gradle.dsl.JvmTarget.JVM_17
    }
}

flutter {
    source = "../.."
}
