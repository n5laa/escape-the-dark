// @ts-nocheck
"use strict";

// =====================================================
// ESCAPE THE DARK - V1.1
// نسخة مطورة: مطاردات أقوى + سرعة ثابتة بين الأجهزة
// =====================================================

var canvas = document.getElementById("gameCanvas");
var ctx = canvas.getContext("2d");

// عناصر الواجهة
var mainMenu = document.getElementById("mainMenu");
var levelsMenu = document.getElementById("levelsMenu");
var storeMenu = document.getElementById("storeMenu");
var endScreen = document.getElementById("endScreen");
var pauseScreen = document.getElementById("pauseScreen");
var finishScreen = document.getElementById("finishScreen");
var gameHUD = document.getElementById("gameHUD");

var continueBtn = document.getElementById("continueBtn");
var levelsBtn = document.getElementById("levelsBtn");
var storeBtn = document.getElementById("storeBtn");
var fullscreenBtn = document.getElementById("fullscreenBtn");
var soundBtn = document.getElementById("soundBtn");

var nextLevelBtn = document.getElementById("nextLevelBtn");
var retryBtn = document.getElementById("retryBtn");
var homeBtn = document.getElementById("homeBtn");
var pauseBtn = document.getElementById("pauseBtn");
var resumeBtn = document.getElementById("resumeBtn");
var pauseHomeBtn = document.getElementById("pauseHomeBtn");
var finishHomeBtn = document.getElementById("finishHomeBtn");

var levelsContainer = document.getElementById("levelsContainer");
var mainCoins = document.getElementById("mainCoins");
var mainUnlocked = document.getElementById("mainUnlocked");
var mainStars = document.getElementById("mainStars");
var levelsCoins = document.getElementById("levelsCoins");
var storeCoins = document.getElementById("storeCoins");
var storeMessage = document.getElementById("storeMessage");

var speedLevel = document.getElementById("speedLevel");
var lightLevel = document.getElementById("lightLevel");
var healthLevel = document.getElementById("healthLevel");
var staminaLevel = document.getElementById("staminaLevel");
var shieldLevel = document.getElementById("shieldLevel");

var hudLevel = document.getElementById("hudLevel");
var hudHealth = document.getElementById("hudHealth");
var hudKeys = document.getElementById("hudKeys");
var hudCoins = document.getElementById("hudCoins");
var hudTime = document.getElementById("hudTime");
var staminaText = document.getElementById("staminaText");
var staminaFill = document.getElementById("staminaFill");

var endEyebrow = document.getElementById("endEyebrow");
var endTitle = document.getElementById("endTitle");
var endMessage = document.getElementById("endMessage");
var starsText = document.getElementById("starsText");
var rewardText = document.getElementById("rewardText");
var finishStats = document.getElementById("finishStats");

var objectiveBanner = document.getElementById("objectiveBanner");
var toast = document.getElementById("toast");
var portraitHint = document.getElementById("portraitHint");

var joystick = document.getElementById("joystick");
var joystickKnob = document.getElementById("joystickKnob");
var sprintBtn = document.getElementById("sprintBtn");

// إعداد الشاشة
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function screenMin() {
    return Math.min(canvas.width, canvas.height);
}

function updateOrientationHint() {
    var isPhonePortrait =
        window.innerWidth < 600 &&
        window.innerHeight > window.innerWidth;

    if (isPhonePortrait && gameRunning) {
        portraitHint.classList.add("show");
        portraitHint.classList.remove("hidden");
    } else {
        portraitHint.classList.remove("show");
        portraitHint.classList.add("hidden");
    }
}

resizeCanvas();

window.addEventListener("resize", function () {
    resizeCanvas();
    updateOrientationHint();

    if (gameRunning && player) {
        player.x = clamp(
            player.x,
            0,
            canvas.width - player.width
        );

        player.y = clamp(
            player.y,
            0,
            canvas.height - player.height
        );
    }
});

// الحفظ
var SAVE_KEY = "escapeDarkSaveV2";

var defaultSave = {
    coins: 0,
    unlocked: 1,
    sound: true,

    stars: {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0
    },

    upgrades: {
        speed: 0,
        light: 0,
        health: 0,
        stamina: 0,
        shield: 0
    }
};

function cloneDefaultSave() {
    return JSON.parse(
        JSON.stringify(defaultSave)
    );
}

function loadSave() {
    try {
        var raw =
            localStorage.getItem(
                SAVE_KEY
            );

        if (!raw) {
            return cloneDefaultSave();
        }

        var data =
            JSON.parse(raw);

        var result =
            cloneDefaultSave();

        result.coins =
            Number(data.coins) || 0;

        result.unlocked =
            clamp(
                Number(data.unlocked) || 1,
                1,
                6
            );

        result.sound =
            data.sound !== false;

        var i;

        for (
            i = 1;
            i <= 6;
            i++
        ) {
            if (
                data.stars &&
                data.stars[i] !== undefined
            ) {
                result.stars[i] =
                    clamp(
                        Number(
                            data.stars[i]
                        ) || 0,
                        0,
                        3
                    );
            }
        }

        var names = [
            "speed",
            "light",
            "health",
            "stamina",
            "shield"
        ];

        for (
            i = 0;
            i < names.length;
            i++
        ) {
            var name =
                names[i];

            if (
                data.upgrades &&
                data.upgrades[name] !== undefined
            ) {
                result.upgrades[name] =
                    Number(
                        data.upgrades[name]
                    ) || 0;
            }
        }

        return result;

    } catch (error) {
        return cloneDefaultSave();
    }
}

var saveData =
    loadSave();

function saveGame() {
    localStorage.setItem(
        SAVE_KEY,
        JSON.stringify(
            saveData
        )
    );

    updateMenus();
}

function totalStars() {
    var total = 0;
    var i;

    for (
        i = 1;
        i <= 6;
        i++
    ) {
        total +=
            saveData.stars[i] || 0;
    }

    return total;
}

// =====================================================
// إعدادات المراحل
// =====================================================

var levels = {

    1: {
        name:
            "البداية",

        description:
            "مرحلة سهلة للتعرّف على اللعبة",

        keys: 3,
        coins: 12,
        chests: 1,
        monsters: 1,

        monsterSpeed:
            0.68,

        detection:
            0.27,

        lightRadius:
            0.37,

        walls: 4,
        hideSpots: 0,

        threeStarTime:
            60,

        twoStarTime:
            95,

        mode:
            "keys"
    },


    2: {
        name:
            "الممرات",

        description:
            "ابحث عن المفاتيح وتجنب الجدران",

        keys: 4,
        coins: 16,
        chests: 2,
        monsters: 1,

        monsterSpeed:
            0.76,

        detection:
            0.30,

        lightRadius:
            0.34,

        walls: 6,
        hideSpots: 1,

        threeStarTime:
            80,

        twoStarTime:
            125,

        mode:
            "keys"
    },


    3: {
        name:
            "المطاردة",

        description:
            "هناك وحشان يطاردانك في هذه المرحلة",

        keys: 4,
        coins: 20,
        chests: 2,
        monsters: 2,

        monsterSpeed:
            0.82,

        detection:
            0.33,

        lightRadius:
            0.32,

        walls: 8,
        hideSpots: 1,

        threeStarTime:
            95,

        twoStarTime:
            150,

        mode:
            "keys"
    },


    4: {
        name:
            "انطفأ النور",

        description:
            "إضاءة أضعف ووحش أكثر خطورة",

        keys: 5,
        coins: 23,
        chests: 3,
        monsters: 1,

        monsterSpeed:
            0.88,

        detection:
            0.36,

        lightRadius:
            0.26,

        walls: 8,
        hideSpots: 2,

        flicker:
            true,

        threeStarTime:
            110,

        twoStarTime:
            170,

        mode:
            "keys"
    },


    5: {
        name:
            "لا تتوقف",

        description:
            "وحشان مع أماكن اختباء محدودة",

        keys: 5,
        coins: 27,
        chests: 3,
        monsters: 2,

        monsterSpeed:
            0.94,

        detection:
            0.38,

        lightRadius:
            0.29,

        walls: 10,
        hideSpots: 3,

        threeStarTime:
            120,

        twoStarTime:
            190,

        mode:
            "keys"
    },


    6: {
        name:
            "الزعيم",

        description:
            "اجمع البلورات واهرب من الزعيم",

        keys: 3,
        coins: 32,
        chests: 3,
        monsters: 1,

        monsterSpeed:
            0.86,

        detection:
            0.60,

        lightRadius:
            0.31,

        walls: 8,
        hideSpots: 2,

        threeStarTime:
            145,

        twoStarTime:
            220,

        mode:
            "boss"
    }

};


var TOTAL_LEVELS =
    6;


// =====================================================
// حالة اللعبة
// =====================================================

var currentLevel =
    1;

var gameRunning =
    false;

var gamePaused =
    false;

var gameEnded =
    false;


var player =
    null;

var monsters =
    [];

var collectibles =
    [];

var gameCoins =
    [];

var chests =
    [];

var walls =
    [];

var hideSpots =
    [];

var exitDoor =
    null;


var collectedCount =
    0;

var coinsCollected =
    0;


var levelStartTime =
    0;

var pausedAt =
    0;

var pausedDuration =
    0;


var screenShake =
    0;

var frozenTimer =
    0;

var speedBoostTimer =
    0;

var toastTimer =
    null;

var objectiveTimer =
    null;

var levelRewarded =
    false;


// V1.1
var frameScale =
    1;

var lastFrameTime =
    0;

var chaseWasActive =
    false;

var chaseIntensity =
    0;

var heartbeatTimer =
    0;

var rageActive =
    false;

var rageAnnounced =
    false;


// =====================================================
// الصوت
// =====================================================

var audioContext =
    null;


function enableAudio() {

    if (!saveData.sound) {
        return;
    }


    if (!audioContext) {

        var AudioCtx =
            window.AudioContext ||
            window.webkitAudioContext;


        if (AudioCtx) {
            audioContext =
                new AudioCtx();
        }

    }


    if (
        audioContext &&
        audioContext.state ===
        "suspended"
    ) {
        audioContext.resume();
    }

}


function tone(
    frequency,
    duration,
    volume,
    type
) {

    if (!saveData.sound) {
        return;
    }


    if (!audioContext) {
        enableAudio();
    }


    if (!audioContext) {
        return;
    }


    var oscillator =
        audioContext
            .createOscillator();


    var gain =
        audioContext
            .createGain();


    oscillator.type =
        type || "sine";


    oscillator.frequency.value =
        frequency;


    gain.gain.setValueAtTime(
        volume || 0.04,
        audioContext.currentTime
    );


    gain.gain.exponentialRampToValueAtTime(
        0.001,
        audioContext.currentTime +
        (duration || 0.15)
    );


    oscillator.connect(
        gain
    );


    gain.connect(
        audioContext.destination
    );


    oscillator.start();


    oscillator.stop(
        audioContext.currentTime +
        (duration || 0.15)
    );

}


function soundCollect() {

    tone(
        900,
        0.08,
        0.035,
        "triangle"
    );

}


function soundKey() {

    tone(
        700,
        0.12,
        0.055,
        "triangle"
    );


    setTimeout(
        function () {

            tone(
                1000,
                0.13,
                0.045,
                "triangle"
            );

        },
        80
    );

}


function soundDamage() {

    tone(
        82,
        0.35,
        0.11,
        "sawtooth"
    );

}


function soundReward() {

    tone(
        480,
        0.12,
        0.045,
        "triangle"
    );


    setTimeout(
        function () {

            tone(
                850,
                0.19,
                0.05,
                "triangle"
            );

        },
        100
    );

}


// =====================================================
// أدوات عامة
// =====================================================

function random(
    min,
    max
) {

    return (
        Math.random() *
        (max - min) +
        min
    );

}


function distance(
    x1,
    y1,
    x2,
    y2
) {

    return Math.hypot(
        x2 - x1,
        y2 - y1
    );

}


function collide(
    a,
    b
) {

    return (

        a.x <
        b.x + b.width &&

        a.x + a.width >
        b.x &&

        a.y <
        b.y + b.height &&

        a.y + a.height >
        b.y

    );

}


function getElapsedSeconds() {

    if (!levelStartTime) {
        return 0;
    }


    var now =
        gamePaused
            ? pausedAt
            : Date.now();


    return Math.max(
        0,
        Math.floor(
            (
                now -
                levelStartTime -
                pausedDuration
            ) /
            1000
        )
    );

}


function showToast(text) {

    toast.textContent =
        text;


    toast.classList.remove(
        "hidden"
    );


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(
            function () {

                toast.classList.add(
                    "hidden"
                );

            },
            1900
        );

}


function showObjective(text) {

    objectiveBanner.textContent =
        text;


    objectiveBanner.classList.remove(
        "hidden"
    );


    clearTimeout(
        objectiveTimer
    );


    objectiveTimer =
        setTimeout(
            function () {

                objectiveBanner.classList.add(
                    "hidden"
                );

            },
            2700
        );

}


function hideAllScreens() {

    mainMenu.classList.add(
        "hidden"
    );

    levelsMenu.classList.add(
        "hidden"
    );

    storeMenu.classList.add(
        "hidden"
    );

    endScreen.classList.add(
        "hidden"
    );

    pauseScreen.classList.add(
        "hidden"
    );

    finishScreen.classList.add(
        "hidden"
    );

}


function resetInputs() {

    keyboard.up =
        false;

    keyboard.down =
        false;

    keyboard.left =
        false;

    keyboard.right =
        false;

    keyboard.sprint =
        false;


    movement.x =
        0;

    movement.y =
        0;


    sprintHeld =
        false;


    joystickPointer =
        null;


    joystickKnob.style.transform =
        "translate(-50%, -50%)";

}


// =====================================================
// القوائم
// =====================================================

function showMainMenu() {

    gameRunning =
        false;

    gamePaused =
        false;

    gameEnded =
        false;


    hideAllScreens();


    gameHUD.classList.add(
        "hidden"
    );


    joystick.classList.add(
        "hidden"
    );


    sprintBtn.classList.add(
        "hidden"
    );


    toast.classList.add(
        "hidden"
    );


    objectiveBanner.classList.add(
        "hidden"
    );


    mainMenu.classList.remove(
        "hidden"
    );


    resetInputs();

    updateMenus();

    updateOrientationHint();

}


function updateMenus() {

    mainCoins.textContent =
        saveData.coins;


    mainUnlocked.textContent =
        saveData.unlocked +
        " / 6";


    mainStars.textContent =
        totalStars() +
        " / 18";


    levelsCoins.textContent =
        saveData.coins;


    storeCoins.textContent =
        saveData.coins;


    speedLevel.textContent =
        saveData.upgrades.speed;


    lightLevel.textContent =
        saveData.upgrades.light;


    healthLevel.textContent =
        saveData.upgrades.health;


    staminaLevel.textContent =
        saveData.upgrades.stamina;


    shieldLevel.textContent =
        saveData.upgrades.shield;


    soundBtn.textContent =
        saveData.sound
            ? "الصوت: شغال"
            : "الصوت: متوقف";


    renderLevels();

    updateStoreButtons();

}


function renderLevels() {

    levelsContainer.innerHTML =
        "";


    var level;


    for (
        level = 1;
        level <= TOTAL_LEVELS;
        level++
    ) {

        createLevelCard(
            level
        );

    }

}


function createLevelCard(level) {

    var config =
        levels[level];


    var unlocked =
        level <=
        saveData.unlocked;


    var stars =
        saveData.stars[level] ||
        0;


    var card =
        document.createElement(
            "div"
        );


    card.className =
        "level-card" +
        (
            unlocked
                ? ""
                : " locked"
        );


    var status =
        unlocked
            ? "مفتوحة"
            : "مقفلة";


    var danger =
        config.monsters === 1
            ? "وحش واحد"
            : config.monsters +
              " وحوش";


    if (level === 6) {

        danger =
            "الزعيم";

    }


    card.innerHTML =

        '<div class="level-number">المرحلة ' +
        level +
        '</div>' +

        '<div class="level-name">' +
        config.name +
        '</div>' +

        '<div class="level-info">' +
        config.description +
        '<br>' +
        danger +
        '</div>' +

        '<div class="level-stars">النجوم: ' +
        stars +
        ' / 3</div>' +

        '<div class="level-lock">' +
        status +
        '</div>';


    if (unlocked) {

        card.addEventListener(
            "click",
            function () {

                enableAudio();

                startLevel(
                    level
                );

            }
        );

    }


    levelsContainer.appendChild(
        card
    );

}


// =====================================================
// المتجر
// =====================================================

var upgradeData = {

    speed: {
        cost: 120,
        max: 5
    },

    light: {
        cost: 150,
        max: 5
    },

    health: {
        cost: 240,
        max: 2
    },

    stamina: {
        cost: 130,
        max: 5
    },

    shield: {
        cost: 200,
        max: 3
    }

};function updateStoreButtons() {

    var buttons =
        document.querySelectorAll(
            ".buy-button"
        );


    buttons.forEach(
        function (button) {

            var type =
                button.dataset.upgrade;


            var info =
                upgradeData[type];


            if (!info) {
                return;
            }


            var level =
                saveData.upgrades[type];


            if (
                level >=
                info.max
            ) {

                button.textContent =
                    "تم الوصول للحد الأعلى";


                button.disabled =
                    true;

            } else {

                button.textContent =
                    "شراء - " +
                    info.cost;


                button.disabled =
                    false;

            }

        }
    );

}


function showStoreMessage(text) {

    storeMessage.textContent =
        text;


    setTimeout(
        function () {

            if (
                storeMessage.textContent ===
                text
            ) {

                storeMessage.textContent =
                    "";

            }

        },
        1700
    );

}


document
    .querySelectorAll(
        ".buy-button"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    enableAudio();


                    var type =
                        button.dataset.upgrade;


                    var info =
                        upgradeData[type];


                    if (!info) {
                        return;
                    }


                    if (
                        saveData.upgrades[type] >=
                        info.max
                    ) {

                        showStoreMessage(
                            "وصلت إلى الحد الأعلى"
                        );

                        return;

                    }


                    if (
                        saveData.coins <
                        info.cost
                    ) {

                        showStoreMessage(
                            "عملاتك غير كافية"
                        );

                        return;

                    }


                    saveData.coins -=
                        info.cost;


                    saveData.upgrades[type]++;


                    saveGame();


                    showStoreMessage(
                        "تم شراء الترقية"
                    );


                    soundReward();

                }
            );

        }
    );


// =====================================================
// أزرار القوائم
// =====================================================

continueBtn.addEventListener(
    "click",
    function () {

        enableAudio();

        startLevel(
            saveData.unlocked
        );

    }
);


levelsBtn.addEventListener(
    "click",
    function () {

        hideAllScreens();

        levelsMenu.classList.remove(
            "hidden"
        );

        renderLevels();

    }
);


storeBtn.addEventListener(
    "click",
    function () {

        hideAllScreens();

        storeMenu.classList.remove(
            "hidden"
        );

        updateMenus();

    }
);


document
    .querySelectorAll(
        "[data-back]"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                showMainMenu
            );

        }
    );


fullscreenBtn.addEventListener(
    "click",
    async function () {

        try {

            if (
                !document.fullscreenElement
            ) {

                await document
                    .documentElement
                    .requestFullscreen();

            } else {

                await document
                    .exitFullscreen();

            }

        } catch (error) {

        }

    }
);


soundBtn.addEventListener(
    "click",
    function () {

        saveData.sound =
            !saveData.sound;


        saveGame();


        if (
            saveData.sound
        ) {

            enableAudio();

            tone(
                620,
                0.12,
                0.04,
                "triangle"
            );

        }

    }
);


// =====================================================
// بناء المرحلة
// =====================================================

function startLevel(
    levelNumber
) {

    currentLevel =
        clamp(
            levelNumber,
            1,
            TOTAL_LEVELS
        );


    var config =
        levels[currentLevel];


    hideAllScreens();

    resizeCanvas();


    gameHUD.classList.remove(
        "hidden"
    );


    joystick.classList.remove(
        "hidden"
    );


    sprintBtn.classList.remove(
        "hidden"
    );


    var minSize =
        screenMin();


    player = {

        x:
            canvas.width *
            0.055,

        y:
            canvas.height *
            0.80,


        width:
            clamp(
                minSize *
                0.040,
                24,
                38
            ),


        height:
            clamp(
                minSize *
                0.056,
                34,
                50
            ),


        baseSpeed:

            clamp(
                minSize *
                0.0046,
                2.65,
                4.7
            ) *

            (
                1 +
                saveData
                    .upgrades
                    .speed *
                0.055
            ),


        health:
            3 +
            saveData
                .upgrades
                .health,


        maxHealth:
            3 +
            saveData
                .upgrades
                .health,


        staminaMax:
            100 +
            saveData
                .upgrades
                .stamina *
            18,


        stamina:
            100 +
            saveData
                .upgrades
                .stamina *
            18,


        invincible:
            0,


        shield:

            Math.random() <

            saveData
                .upgrades
                .shield *
            0.11,


        hidden:
            false,


        hideTime:
            0,


        hideCooldown:
            0,


        facingX:
            1,


        facingY:
            0,


        walkCycle:
            0

    };


    walls =
        createWalls(
            config.walls
        );


    hideSpots =
        createHideSpots(
            config.hideSpots
        );


    collectibles =
        createCollectibles(
            config.keys,
            config.mode
        );


    gameCoins =
        createCoins(
            config.coins
        );


    chests =
        createChests(
            config.chests
        );


    monsters =
        createMonsters(
            config
        );


    exitDoor = {

        x:
            canvas.width *
            0.91,


        y:
            canvas.height *
            0.75,


        width:
            clamp(
                minSize *
                0.060,
                40,
                66
            ),


        height:
            clamp(
                minSize *
                0.115,
                67,
                100
            ),


        open:
            false

    };


    collectedCount =
        0;


    coinsCollected =
        0;


    frozenTimer =
        0;


    speedBoostTimer =
        0;


    screenShake =
        0;


    levelRewarded =
        false;


    chaseWasActive =
        false;


    chaseIntensity =
        0;


    heartbeatTimer =
        0;


    rageActive =
        false;


    rageAnnounced =
        false;


    gameRunning =
        true;


    gamePaused =
        false;


    gameEnded =
        false;


    levelStartTime =
        Date.now();


    pausedDuration =
        0;


    pausedAt =
        0;


    resetInputs();

    updateHUD();

    updateOrientationHint();


    if (
        currentLevel ===
        6
    ) {

        showObjective(
            "اجمع 3 بلورات وافتح الباب قبل أن يمسك بك الزعيم"
        );

    } else if (
        config.hideSpots >
        0
    ) {

        showObjective(
            "اجمع المفاتيح واستخدم أماكن الاختباء عند الحاجة"
        );

    } else {

        showObjective(
            "اجمع المفاتيح، خذ الجوائز، واهرب من الظلام"
        );

    }

}


// =====================================================
// الجدران والأماكن
// =====================================================

function createWalls(count) {

    var w =
        canvas.width;


    var h =
        canvas.height;


    var thick =
        clamp(
            screenMin() *
            0.027,
            17,
            27
        );


    var presets = [

        {
            x: w * 0.16,
            y: h * 0.28,
            width: w * 0.15,
            height: thick
        },

        {
            x: w * 0.39,
            y: h * 0.16,
            width: thick,
            height: h * 0.21
        },

        {
            x: w * 0.59,
            y: h * 0.38,
            width: w * 0.16,
            height: thick
        },

        {
            x: w * 0.31,
            y: h * 0.62,
            width: thick,
            height: h * 0.17
        },

        {
            x: w * 0.71,
            y: h * 0.68,
            width: w * 0.13,
            height: thick
        },

        {
            x: w * 0.50,
            y: h * 0.53,
            width: thick,
            height: h * 0.17
        },

        {
            x: w * 0.09,
            y: h * 0.55,
            width: w * 0.12,
            height: thick
        },

        {
            x: w * 0.77,
            y: h * 0.18,
            width: thick,
            height: h * 0.19
        },

        {
            x: w * 0.44,
            y: h * 0.80,
            width: w * 0.14,
            height: thick
        },

        {
            x: w * 0.20,
            y: h * 0.43,
            width: thick,
            height: h * 0.14
        }

    ];


    return presets.slice(
        0,
        count
    );

}


function pointNearWall(
    x,
    y,
    radius
) {

    var i;


    for (
        i = 0;
        i < walls.length;
        i++
    ) {

        var wall =
            walls[i];


        if (

            x >
            wall.x -
            radius &&

            x <
            wall.x +
            wall.width +
            radius &&

            y >
            wall.y -
            radius &&

            y <
            wall.y +
            wall.height +
            radius

        ) {

            return true;

        }

    }


    return false;

}


function pointNearExisting(
    x,
    y,
    list,
    radius
) {

    var i;


    for (
        i = 0;
        i < list.length;
        i++
    ) {

        if (

            distance(
                x,
                y,
                list[i].x,
                list[i].y
            ) <
            radius

        ) {

            return true;

        }

    }


    return false;

}


function getSafePosition(
    existingList,
    radius,
    awayFromPlayer
) {

    var attempt;


    for (
        attempt = 0;
        attempt < 160;
        attempt++
    ) {

        var x =
            random(
                canvas.width *
                0.10,
                canvas.width *
                0.87
            );


        var y =
            random(
                canvas.height *
                0.13,
                canvas.height *
                0.84
            );


        if (
            pointNearWall(
                x,
                y,
                radius
            )
        ) {

            continue;

        }


        if (

            existingList &&

            pointNearExisting(
                x,
                y,
                existingList,
                radius *
                2.4
            )

        ) {

            continue;

        }


        if (
            awayFromPlayer &&
            player
        ) {

            var px =
                player.x +
                player.width /
                2;


            var py =
                player.y +
                player.height /
                2;


            if (

                distance(
                    x,
                    y,
                    px,
                    py
                ) <

                screenMin() *
                0.20

            ) {

                continue;

            }

        }


        return {

            x:
                x,

            y:
                y

        };

    }


    return {

        x:
            canvas.width *
            0.50,

        y:
            canvas.height *
            0.50

    };

}


// =====================================================
// أماكن الاختباء
// =====================================================

function createHideSpots(
    count
) {

    var list =
        [];


    var size =
        clamp(
            screenMin() *
            0.075,
            50,
            78
        );


    var i;


    for (
        i = 0;
        i < count;
        i++
    ) {

        var pos =
            getSafePosition(
                list,
                size *
                0.55,
                true
            );


        list.push({

            x:
                pos.x,

            y:
                pos.y,

            width:
                size,

            height:
                size *
                0.75

        });

    }


    return list;

}


// =====================================================
// المفاتيح والبلورات
// =====================================================

function createCollectibles(
    count,
    mode
) {

    var list =
        [];


    var i;


    for (
        i = 0;
        i < count;
        i++
    ) {

        var pos =
            getSafePosition(
                list,
                34,
                true
            );


        list.push({

            x:
                pos.x,

            y:
                pos.y,

            collected:
                false,

            phase:
                Math.random() *
                Math.PI *
                2,

            kind:
                mode ===
                "boss"

                    ? "crystal"

                    : "key"

        });

    }


    return list;

}


// =====================================================
// العملات
// =====================================================

function createCoins(
    count
) {

    var list =
        [];


    var i;


    for (
        i = 0;
        i < count;
        i++
    ) {

        var pos =
            getSafePosition(
                list,
                18,
                false
            );


        list.push({

            x:
                pos.x,

            y:
                pos.y,

            collected:
                false,

            phase:
                Math.random() *
                Math.PI *
                2

        });

    }


    return list;

}


// =====================================================
// الصناديق
// =====================================================

function createChests(
    count
) {

    var list =
        [];


    var size =
        clamp(
            screenMin() *
            0.047,
            31,
            42
        );


    var i;


    for (
        i = 0;
        i < count;
        i++
    ) {

        var pos =
            getSafePosition(
                list,
                size,
                true
            );


        list.push({

            x:
                pos.x,

            y:
                pos.y,

            width:
                size,

            height:
                size *
                0.72,

            opened:
                false,

            opening:
                0,

            rewardGiven:
                false

        });

    }


    return list;

}


// =====================================================
// إنشاء الوحوش
// =====================================================

function createMonsters(
    config
) {

    var list =
        [];


    var size =
        clamp(
            screenMin() *
            0.055,
            35,
            54
        );


    var i;


    for (
        i = 0;
        i < config.monsters;
        i++
    ) {

        var isBoss =
            config.mode ===
            "boss";


        var speedTrait =
            1;


        var detectionTrait =
            1;


        // المرحلة 3:
        // واحد أسرع والآخر يشوف من مسافة أبعد
        if (
            currentLevel ===
            3
        ) {

            if (
                i === 0
            ) {

                speedTrait =
                    1.10;


                detectionTrait =
                    0.92;

            } else {

                speedTrait =
                    0.92;


                detectionTrait =
                    1.18;

            }

        }


        // المرحلة 5
        if (
            currentLevel ===
            5
        ) {

            if (
                i === 0
            ) {

                speedTrait =
                    1.06;


                detectionTrait =
                    1.00;

            } else {

                speedTrait =
                    0.96;


                detectionTrait =
                    1.12;

            }

        }


        list.push({

            x:
                canvas.width *
                (
                    0.80 -
                    i *
                    0.18
                ),


            y:
                canvas.height *
                (
                    0.14 +
                    i *
                    0.22
                ),


            width:
                isBoss
                    ? size *
                      1.65
                    : size,


            height:
                isBoss
                    ? size *
                      1.65
                    : size,


            baseSpeed:

                clamp(
                    screenMin() *
                    0.0035,
                    1.85,
                    3.45
                ) *

                config.monsterSpeed *

                speedTrait,


            detection:

                screenMin() *

                config.detection *

                detectionTrait,


            active:
                false,


            searching:
                false,


            searchTimer:
                0,


            lastKnownX:
                0,


            lastKnownY:
                0,


            wanderAngle:
                Math.random() *
                Math.PI *
                2,


            isBoss:
                isBoss,


            dashCooldown:
                isBoss
                    ? 210
                    : 0,


            dashWarning:
                0,


            dashTimer:
                0,


            dashX:
                0,


            dashY:
                0

        });

    }


    return list;

}


// =====================================================
// الكيبورد
// =====================================================

var keyboard = {

    up:
        false,

    down:
        false,

    left:
        false,

    right:
        false,

    sprint:
        false

};


function keyToDirection(key) {

    var k =
        key.toLowerCase();


    if (
        k === "w" ||
        k === "arrowup"
    ) {

        return "up";

    }


    if (
        k === "s" ||
        k === "arrowdown"
    ) {

        return "down";

    }


    if (
        k === "a" ||
        k === "arrowleft"
    ) {

        return "left";

    }


    if (
        k === "d" ||
        k === "arrowright"
    ) {

        return "right";

    }


    return null;

}


document.addEventListener(
    "keydown",
    function (event) {

        var direction =
            keyToDirection(
                event.key
            );


        if (
            direction
        ) {

            event.preventDefault();


            keyboard[direction] =
                true;

        }


        if (
            event.key ===
            "Shift"
        ) {

            keyboard.sprint =
                true;

        }

    }
);


document.addEventListener(
    "keyup",
    function (event) {

        var direction =
            keyToDirection(
                event.key
            );


        if (
            direction
        ) {

            event.preventDefault();


            keyboard[direction] =
                false;

        }


        if (
            event.key ===
            "Shift"
        ) {

            keyboard.sprint =
                false;

        }

    }
);


// =====================================================
// Joystick
// =====================================================

var movement = {

    x:
        0,

    y:
        0

};


var joystickPointer =
    null;


var sprintHeld =
    false;


joystick.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();


        joystickPointer =
            event.pointerId;


        joystick.setPointerCapture(
            event.pointerId
        );


        updateJoystick(
            event
        );

    }
);


joystick.addEventListener(
    "pointermove",
    function (event) {

        if (
            event.pointerId !==
            joystickPointer
        ) {

            return;

        }


        updateJoystick(
            event
        );

    }
);


joystick.addEventListener(
    "pointerup",
    stopJoystick
);


joystick.addEventListener(
    "pointercancel",
    stopJoystick
);


function updateJoystick(
    event
) {

    var rect =
        joystick
            .getBoundingClientRect();


    var centerX =
        rect.left +
        rect.width /
        2;


    var centerY =
        rect.top +
        rect.height /
        2;


    var dx =
        event.clientX -
        centerX;


    var dy =
        event.clientY -
        centerY;


    var maxDistance =
        rect.width *
        0.31;


    var len =
        Math.hypot(
            dx,
            dy
        );


    if (
        len >
        maxDistance &&
        len > 0
    ) {

        dx =
            dx /
            len *
            maxDistance;


        dy =
            dy /
            len *
            maxDistance;

    }


    movement.x =
        dx /
        maxDistance;


    movement.y =
        dy /
        maxDistance;


    joystickKnob.style.transform =

        "translate(calc(-50% + " +

        dx +

        "px), calc(-50% + " +

        dy +

        "px))";

}


function stopJoystick() {

    joystickPointer =
        null;


    movement.x =
        0;


    movement.y =
        0;


    joystickKnob.style.transform =
        "translate(-50%, -50%)";

}


sprintBtn.addEventListener(
    "pointerdown",
    function (event) {

        event.preventDefault();

        sprintHeld =
            true;

    }
);


sprintBtn.addEventListener(
    "pointerup",
    function (event) {

        event.preventDefault();

        sprintHeld =
            false;

    }
);


sprintBtn.addEventListener(
    "pointercancel",
    function () {

        sprintHeld =
            false;

    }
);


sprintBtn.addEventListener(
    "pointerleave",
    function () {

        sprintHeld =
            false;

    }
);


// =====================================================
// التصادم
// =====================================================

function hitsWall(
    object
) {

    var i;


    for (
        i = 0;
        i < walls.length;
        i++
    ) {

        if (
            collide(
                object,
                walls[i]
            )
        ) {

            return true;

        }

    }


    return false;

}


function moveWithWalls(
    object,
    dx,
    dy,
    speed
) {

    speed *=
        frameScale;


    var nextX = {

        x:
            object.x +
            dx *
            speed,

        y:
            object.y,

        width:
            object.width,

        height:
            object.height

    };


    if (

        nextX.x >=
        0 &&

        nextX.x +
        nextX.width <=
        canvas.width &&

        !hitsWall(
            nextX
        )

    ) {

        object.x =
            nextX.x;

    }


    var nextY = {

        x:
            object.x,

        y:
            object.y +
            dy *
            speed,

        width:
            object.width,

        height:
            object.height

    };


    if (

        nextY.y >=
        0 &&

        nextY.y +
        nextY.height <=
        canvas.height &&

        !hitsWall(
            nextY
        )

    ) {

        object.y =
            nextY.y;

    }

}// =====================================================
// الاختباء
// =====================================================

function updateHiding() {

    if (!player) {
        return;
    }


    var inside =
        false;


    var i;


    for (
        i = 0;
        i < hideSpots.length;
        i++
    ) {

        if (
            collide(
                player,
                hideSpots[i]
            )
        ) {

            inside =
                true;

            break;

        }

    }


    if (
        player.hideCooldown >
        0
    ) {

        player.hideCooldown -=
            frameScale;

    }


    if (

        inside &&

        player.hideCooldown <=
        0 &&

        player.hideTime <
        180

    ) {

        player.hidden =
            true;


        player.hideTime +=
            frameScale;


        if (
            player.hideTime <=
            frameScale +
            0.1
        ) {

            showToast(
                "دخلت مكان الاختباء"
            );

        }

    } else {

        if (

            player.hidden &&

            player.hideTime >=
            180

        ) {

            showToast(
                "اخرج من مكان الاختباء الآن"
            );


            player.hideCooldown =
                240;

        }


        player.hidden =
            false;


        if (
            !inside
        ) {

            player.hideTime =
                0;

        }

    }

}


// =====================================================
// اللاعب والركض
// =====================================================

function updatePlayer() {

    var dx =
        movement.x;


    var dy =
        movement.y;


    if (
        keyboard.left
    ) {

        dx -= 1;

    }


    if (
        keyboard.right
    ) {

        dx += 1;

    }


    if (
        keyboard.up
    ) {

        dy -= 1;

    }


    if (
        keyboard.down
    ) {

        dy += 1;

    }


    var len =
        Math.hypot(
            dx,
            dy
        );


    if (
        len > 1
    ) {

        dx /=
            len;


        dy /=
            len;

    }


    if (

        Math.abs(dx) >
        0.02 ||

        Math.abs(dy) >
        0.02

    ) {

        player.facingX =
            dx;


        player.facingY =
            dy;


        player.walkCycle +=
            0.16 *
            frameScale;

    }


    var wantsSprint =

        keyboard.sprint ||

        sprintHeld;


    var sprinting =

        wantsSprint &&

        player.stamina >
        0 &&

        len >
        0.05;


    var speed =
        player.baseSpeed;


    if (
        sprinting
    ) {

        speed *=
            1.52;


        player.stamina -=
            0.62 *
            frameScale;

    } else {

        player.stamina +=
            0.32 *
            frameScale;

    }


    player.stamina =
        clamp(
            player.stamina,
            0,
            player.staminaMax
        );


    if (
        speedBoostTimer >
        0
    ) {

        speed *=
            1.35;


        speedBoostTimer -=
            frameScale;

    }


    moveWithWalls(
        player,
        dx,
        dy,
        speed
    );


    if (
        player.invincible >
        0
    ) {

        player.invincible -=
            frameScale;

    }


    updateHiding();

}


// =====================================================
// الوحوش
// =====================================================

function updateMonsters() {

    if (
        frozenTimer >
        0
    ) {

        frozenTimer -=
            frameScale;

        return;

    }


    monsters.forEach(
        function (monster) {

            updateMonster(
                monster
            );


            checkMonsterAttack(
                monster
            );

        }
    );

}


function updateMonster(
    monster
) {

    var px =
        player.x +
        player.width /
        2;


    var py =
        player.y +
        player.height /
        2;


    var mx =
        monster.x +
        monster.width /
        2;


    var my =
        monster.y +
        monster.height /
        2;


    var dist =
        distance(
            px,
            py,
            mx,
            my
        );


    var seesPlayer =

        !player.hidden &&

        dist <
        monster.detection;


    monster.active =
        seesPlayer;


    if (
        seesPlayer
    ) {

        monster.lastKnownX =
            px;


        monster.lastKnownY =
            py;


        monster.searchTimer =
            95;


        monster.searching =
            false;

    } else if (
        monster.searchTimer >
        0
    ) {

        monster.searchTimer -=
            frameScale;


        monster.searching =
            true;

    } else {

        monster.searching =
            false;

    }


    if (
        monster.isBoss
    ) {

        updateBoss(
            monster,
            px,
            py,
            mx,
            my
        );

        return;

    }


    var dx =
        0;


    var dy =
        0;


    if (
        monster.active
    ) {

        dx =
            px -
            mx;


        dy =
            py -
            my;

    } else if (
        monster.searching
    ) {

        dx =
            monster.lastKnownX -
            mx;


        dy =
            monster.lastKnownY -
            my;


        if (
            Math.hypot(
                dx,
                dy
            ) <
            25
        ) {

            monster.wanderAngle +=
                0.045 *
                frameScale;


            dx =
                Math.cos(
                    monster.wanderAngle
                );


            dy =
                Math.sin(
                    monster.wanderAngle
                );

        }

    } else {

        monster.wanderAngle +=
            0.013 *
            frameScale;


        dx =
            Math.cos(
                monster.wanderAngle
            );


        dy =
            Math.sin(
                monster.wanderAngle *
                0.83
            );

    }


    var len =
        Math.hypot(
            dx,
            dy
        ) || 1;


    dx /=
        len;


    dy /=
        len;


    var speed =

        monster.baseSpeed *

        (
            1 +
            collectedCount *
            0.018
        );


    if (
        monster.active
    ) {

        speed *=
            1.08;

    }


    if (
        monster.searching
    ) {

        speed *=
            0.82;

    }


    if (
        rageActive
    ) {

        speed *=
            1.12;

    }


    moveWithWalls(
        monster,
        dx,
        dy,
        speed
    );

}


// =====================================================
// الزعيم
// =====================================================

function updateBoss(
    monster,
    px,
    py,
    mx,
    my
) {

    if (
        monster.dashCooldown >
        0
    ) {

        monster.dashCooldown -=
            frameScale;

    }


    if (
        monster.dashTimer >
        0
    ) {

        monster.dashTimer -=
            frameScale;


        moveWithWalls(
            monster,
            monster.dashX,
            monster.dashY,
            monster.baseSpeed *
            3.35
        );


        return;

    }


    var dx =
        px -
        mx;


    var dy =
        py -
        my;


    var len =
        Math.hypot(
            dx,
            dy
        ) || 1;


    dx /=
        len;


    dy /=
        len;


    if (
        monster.dashWarning >
        0
    ) {

        monster.dashWarning -=
            frameScale;


        screenShake =
            Math.max(
                screenShake,
                1.8
            );


        moveWithWalls(
            monster,
            dx,
            dy,
            monster.baseSpeed *
            0.40
        );


        if (
            monster.dashWarning <=
            0
        ) {

            var newMx =
                monster.x +
                monster.width /
                2;


            var newMy =
                monster.y +
                monster.height /
                2;


            var dashDx =
                px -
                newMx;


            var dashDy =
                py -
                newMy;


            var dashLen =
                Math.hypot(
                    dashDx,
                    dashDy
                ) || 1;


            monster.dashX =
                dashDx /
                dashLen;


            monster.dashY =
                dashDy /
                dashLen;


            monster.dashTimer =
                23;


            monster.dashCooldown =
                210;


            tone(
                70,
                0.24,
                0.07,
                "sawtooth"
            );

        }


        return;

    }


    if (

        monster.active &&

        monster.dashCooldown <=
        0 &&

        distance(
            px,
            py,
            mx,
            my
        ) >
        120

    ) {

        monster.dashWarning =
            56;


        showToast(
            "انتبه! الزعيم يستعد للاندفاع"
        );


        tone(
            125,
            0.18,
            0.055,
            "square"
        );


        return;

    }


    var speed =

        monster.baseSpeed *

        (
            1 +
            collectedCount *
            0.035
        );


    if (
        monster.active
    ) {

        speed *=
            1.05;

    }


    if (
        rageActive
    ) {

        speed *=
            1.18;

    }


    moveWithWalls(
        monster,
        dx,
        dy,
        speed
    );

}


// =====================================================
// ضربة الوحش
// =====================================================

function checkMonsterAttack(
    monster
) {

    if (

        player.hidden ||

        player.invincible >
        0

    ) {

        return;

    }


    var playerCenterX =

        player.x +

        player.width /
        2;


    var playerCenterY =

        player.y +

        player.height /
        2;


    var monsterCenterX =

        monster.x +

        monster.width /
        2;


    var monsterCenterY =

        monster.y +

        monster.height /
        2;


    var hitDistance =

        player.width *
        0.34 +

        monster.width *

        (
            monster.isBoss
                ? 0.31
                : 0.34
        );


    var currentDistance =
        distance(
            playerCenterX,
            playerCenterY,
            monsterCenterX,
            monsterCenterY
        );


    if (
        currentDistance >
        hitDistance
    ) {

        return;

    }


    if (
        player.shield
    ) {

        player.shield =
            false;


        player.invincible =
            100;


        showToast(
            "الدرع حماك من الضربة"
        );


        tone(
            360,
            0.24,
            0.055,
            "square"
        );


        return;

    }


    player.health--;


    player.invincible =
        110;


    screenShake =

        monster.isBoss
            ? 24
            : 17;


    soundDamage();


    var dx =

        playerCenterX -

        monsterCenterX;


    var dy =

        playerCenterY -

        monsterCenterY;


    var len =
        Math.hypot(
            dx,
            dy
        ) || 1;


    dx /=
        len;


    dy /=
        len;


    // يدفع اللاعب بدون ما يدخله داخل الجدار
    var step;


    for (
        step = 0;
        step < 12;
        step++
    ) {

        moveWithWalls(
            player,
            dx,
            dy,
            5
        );

    }


    if (
        player.health <=
        0
    ) {

        loseLevel();

    }

}


// =====================================================
// جمع المفاتيح والبلورات
// =====================================================

function checkCollectibles() {

    var px =
        player.x +
        player.width /
        2;


    var py =
        player.y +
        player.height /
        2;


    collectibles.forEach(
        function (item) {

            if (
                item.collected
            ) {

                return;

            }


            if (

                distance(
                    px,
                    py,
                    item.x,
                    item.y
                ) <

                player.width +
                4

            ) {

                item.collected =
                    true;


                collectedCount++;


                soundKey();


                if (
                    item.kind ===
                    "crystal"
                ) {

                    showToast(

                        "جمعت بلورة - " +

                        collectedCount +

                        "/3"

                    );

                } else {

                    showToast(

                        "وجدت مفتاحًا - " +

                        collectedCount +

                        "/" +

                        levels[currentLevel]
                            .keys

                    );

                }


                if (

                    collectedCount >=

                    levels[currentLevel]
                        .keys

                ) {

                    exitDoor.open =
                        true;


                    rageActive =
                        true;


                    if (
                        !rageAnnounced
                    ) {

                        rageAnnounced =
                            true;


                        showToast(
                            "انفتح باب الهروب! الوحوش أصبحت أسرع"
                        );


                        screenShake =
                            Math.max(
                                screenShake,
                                5
                            );

                    }


                    tone(
                        280,
                        0.18,
                        0.05,
                        "triangle"
                    );


                    setTimeout(
                        function () {

                            tone(
                                620,
                                0.28,
                                0.05,
                                "triangle"
                            );

                        },
                        140
                    );

                }

            }

        }
    );

}


// =====================================================
// العملات
// =====================================================

function checkCoins() {

    var px =
        player.x +
        player.width /
        2;


    var py =
        player.y +
        player.height /
        2;


    gameCoins.forEach(
        function (coin) {

            if (
                coin.collected
            ) {

                return;

            }


            if (

                distance(
                    px,
                    py,
                    coin.x,
                    coin.y
                ) <
                24

            ) {

                coin.collected =
                    true;


                var risk =
                    false;


                monsters.forEach(
                    function (monster) {

                        var mx =
                            monster.x +
                            monster.width /
                            2;


                        var my =
                            monster.y +
                            monster.height /
                            2;


                        if (

                            !player.hidden &&

                            distance(
                                px,
                                py,
                                mx,
                                my
                            ) <

                            screenMin() *
                            0.22

                        ) {

                            risk =
                                true;

                        }

                    }
                );


                coinsCollected +=

                    risk
                        ? 2
                        : 1;


                soundCollect();


                if (
                    risk
                ) {

                    showToast(
                        "مكافأة مخاطرة: +2 عملة"
                    );

                }

            }

        }
    );

}


// =====================================================
// الصناديق
// =====================================================

function checkChests() {

    chests.forEach(
        function (chest) {

            if (

                chest.opened ||

                chest.opening >
                0

            ) {

                return;

            }


            if (
                collide(
                    player,
                    chest
                )
            ) {

                chest.opening =
                    0.01;


                tone(
                    220,
                    0.12,
                    0.04,
                    "square"
                );

            }

        }
    );

}


function updateChests() {

    chests.forEach(
        function (chest) {

            if (

                chest.opened ||

                chest.opening <=
                0

            ) {

                return;

            }


            chest.opening +=

                frameScale /
                18;


            if (
                chest.opening >=
                1
            ) {

                chest.opening =
                    1;


                chest.opened =
                    true;


                if (
                    !chest.rewardGiven
                ) {

                    chest.rewardGiven =
                        true;


                    giveRandomReward();

                }

            }

        }
    );

}


// =====================================================
// جوائز الصندوق
// =====================================================

function giveRandomReward() {

    var rewards = [

        "heart",

        "shield",

        "speed",

        "freeze",

        "coins",

        "stamina"

    ];


    var reward =

        rewards[
            Math.floor(
                Math.random() *
                rewards.length
            )
        ];


    if (
        reward ===
        "heart"
    ) {

        if (
            player.health <
            player.maxHealth
        ) {

            player.health++;


            showToast(
                "جائزة الصندوق: قلب إضافي"
            );

        } else {

            coinsCollected +=
                15;


            showToast(
                "قلوبك كاملة - حصلت على 15 عملة"
            );

        }

    }


    if (
        reward ===
        "shield"
    ) {

        player.shield =
            true;


        showToast(
            "جائزة الصندوق: درع يحميك من ضربة"
        );

    }


    if (
        reward ===
        "speed"
    ) {

        speedBoostTimer =
            520;


        showToast(
            "جائزة الصندوق: سرعة مؤقتة"
        );

    }


    if (
        reward ===
        "freeze"
    ) {

        frozenTimer =
            330;


        showToast(
            "جائزة الصندوق: تم تجميد الوحوش"
        );

    }


    if (
        reward ===
        "coins"
    ) {

        coinsCollected +=
            25;


        showToast(
            "جائزة الصندوق: 25 عملة"
        );

    }


    if (
        reward ===
        "stamina"
    ) {

        player.stamina =
            player.staminaMax;


        showToast(
            "جائزة الصندوق: تمت استعادة طاقة الركض"
        );

    }


    soundReward();

}


// =====================================================
// الباب
// =====================================================

function checkDoor() {

    if (
        !exitDoor ||
        !exitDoor.open
    ) {

        return;

    }


    if (
        collide(
            player,
            exitDoor
        )
    ) {

        winLevel();

    }

}


// =====================================================
// النجوم
// =====================================================

function calculateStars(
    seconds
) {

    var config =
        levels[currentLevel];


    var stars =
        1;


    if (
        seconds <=
        config.twoStarTime
    ) {

        stars =
            2;

    }


    if (

        seconds <=
        config.threeStarTime &&

        player.health >=

        Math.max(
            2,
            player.maxHealth -
            1
        )

    ) {

        stars =
            3;

    }


    return stars;

}


// =====================================================
// الفوز
// =====================================================

function winLevel() {

    if (

        gameEnded ||

        levelRewarded

    ) {

        return;

    }


    gameEnded =
        true;


    gameRunning =
        false;


    levelRewarded =
        true;


    var seconds =
        getElapsedSeconds();


    var stars =
        calculateStars(
            seconds
        );


    var starBonus =
        stars *
        18;


    var clearBonus =
        20 +
        currentLevel *
        5;


    var totalReward =

        coinsCollected +

        starBonus +

        clearBonus;


    saveData.coins +=
        totalReward;


    saveData.stars[currentLevel] =

        Math.max(

            saveData.stars[currentLevel] ||
            0,

            stars

        );


    if (
        currentLevel <
        TOTAL_LEVELS
    ) {

        saveData.unlocked =

            Math.max(

                saveData.unlocked,

                currentLevel +
                1

            );

    }


    saveGame();


    gameHUD.classList.add(
        "hidden"
    );


    joystick.classList.add(
        "hidden"
    );


    sprintBtn.classList.add(
        "hidden"
    );


    if (
        currentLevel ===
        TOTAL_LEVELS
    ) {

        showFinishScreen(
            seconds,
            totalReward
        );


        return;

    }


    endEyebrow.textContent =
        "نجوت";


    endTitle.textContent =
        "أنهيت المرحلة";


    endMessage.textContent =

        "أنهيت المرحلة خلال " +

        seconds +

        " ثانية";


    starsText.textContent =

        "النجوم: " +

        stars +

        " / 3";


    rewardText.textContent =

        "العملات المكتسبة: " +

        coinsCollected +

        " + مكافأة " +

        (
            starBonus +
            clearBonus
        ) +

        " = " +

        totalReward;


    nextLevelBtn.classList.remove(
        "hidden"
    );


    retryBtn.textContent =
        "إعادة المرحلة";


    endScreen.classList.remove(
        "hidden"
    );


    tone(
        560,
        0.16,
        0.05,
        "triangle"
    );


    setTimeout(
        function () {

            tone(
                870,
                0.34,
                0.055,
                "triangle"
            );

        },
        170
    );

}


// =====================================================
// الخسارة
// =====================================================

function loseLevel() {

    if (
        gameEnded
    ) {

        return;

    }


    gameEnded =
        true;


    gameRunning =
        false;


    gameHUD.classList.add(
        "hidden"
    );


    joystick.classList.add(
        "hidden"
    );


    sprintBtn.classList.add(
        "hidden"
    );


    endEyebrow.textContent =
        "خسرت";


    endTitle.textContent =
        "أمسك بك الظلام";


    endMessage.textContent =
        "حاول الهروب مرة أخرى";


    starsText.textContent =
        "النجوم: 0 / 3";


    rewardText.textContent =
        "لم يتم حفظ عملات هذه المحاولة";


    nextLevelBtn.classList.add(
        "hidden"
    );


    retryBtn.textContent =
        "إعادة المحاولة";


    endScreen.classList.remove(
        "hidden"
    );


    tone(
        55,
        0.65,
        0.13,
        "sawtooth"
    );

}function showFinishScreen(seconds, reward) {
    hideAllScreens();

    finishStats.textContent =
        "أنهيت المرحلة الأخيرة خلال " +
        seconds +
        " ثانية، وحصلت على " +
        reward +
        " عملة. مجموع النجوم: " +
        totalStars() +
        " / 18";

    finishScreen.classList.remove("hidden");
}


// =====================================================
// أزرار الفوز والخسارة
// =====================================================

nextLevelBtn.addEventListener("click", function () {
    enableAudio();

    if (currentLevel < TOTAL_LEVELS) {
        startLevel(currentLevel + 1);
    }
});


retryBtn.addEventListener("click", function () {
    enableAudio();

    startLevel(currentLevel);
});


homeBtn.addEventListener(
    "click",
    showMainMenu
);


finishHomeBtn.addEventListener(
    "click",
    showMainMenu
);


// =====================================================
// الإيقاف
// =====================================================

pauseBtn.addEventListener("click", function () {

    if (
        !gameRunning ||
        gamePaused
    ) {
        return;
    }


    gamePaused = true;

    pausedAt =
        Date.now();


    pauseScreen.classList.remove(
        "hidden"
    );


    joystick.classList.add(
        "hidden"
    );


    sprintBtn.classList.add(
        "hidden"
    );


    resetInputs();

});


resumeBtn.addEventListener("click", function () {

    if (!gamePaused) {
        return;
    }


    pausedDuration +=
        Date.now() -
        pausedAt;


    gamePaused =
        false;


    pauseScreen.classList.add(
        "hidden"
    );


    joystick.classList.remove(
        "hidden"
    );


    sprintBtn.classList.remove(
        "hidden"
    );


    updateOrientationHint();

});


pauseHomeBtn.addEventListener(
    "click",
    showMainMenu
);


// =====================================================
// تأثيرات المطاردة
// =====================================================

function updateChaseEffects() {

    if (!player) {
        return;
    }


    var isChasing =
        false;


    var closest =
        Infinity;


    var px =
        player.x +
        player.width / 2;


    var py =
        player.y +
        player.height / 2;


    monsters.forEach(function (monster) {

        var mx =
            monster.x +
            monster.width / 2;


        var my =
            monster.y +
            monster.height / 2;


        var dist =
            distance(
                px,
                py,
                mx,
                my
            );


        if (
            monster.active &&
            !player.hidden
        ) {

            isChasing =
                true;


            closest =
                Math.min(
                    closest,
                    dist
                );

        }

    });


    var target =
        0;


    if (isChasing) {

        target =
            clamp(
                1 -
                closest /
                (
                    screenMin() *
                    0.42
                ),
                0.18,
                1
            );

    }


    chaseIntensity +=
        (
            target -
            chaseIntensity
        ) *
        0.10 *
        frameScale;


    chaseIntensity =
        clamp(
            chaseIntensity,
            0,
            1
        );


    if (
        isChasing &&
        !chaseWasActive
    ) {

        showToast(
            "الوحش رآك!"
        );


        screenShake =
            Math.max(
                screenShake,
                3.5
            );


        tone(
            95,
            0.18,
            0.055,
            "sawtooth"
        );

    }


    if (isChasing) {

        heartbeatTimer -=
            frameScale;


        if (
            heartbeatTimer <=
            0
        ) {

            tone(
                52 +
                chaseIntensity *
                12,

                0.08,

                0.026 +
                chaseIntensity *
                0.025,

                "sine"
            );


            heartbeatTimer =
                clamp(
                    52 -
                    chaseIntensity *
                    28,
                    20,
                    52
                );

        }

    } else {

        heartbeatTimer =
            0;

    }


    chaseWasActive =
        isChasing;

}


// =====================================================
// HUD
// =====================================================

function updateHUD() {

    if (!player) {
        return;
    }


    var config =
        levels[currentLevel];


    var itemName =

        config.mode ===
        "boss"

            ? "البلورات"

            : "المفاتيح";


    hudLevel.textContent =

        "المرحلة: " +

        currentLevel +

        " - " +

        config.name;


    hudHealth.textContent =

        "القلوب: " +

        player.health +

        (
            player.shield
                ? " - الدرع مفعّل"
                : ""
        ) +

        (
            player.hidden
                ? " - مختبئ"
                : ""
        );


    hudKeys.textContent =

        itemName +

        ": " +

        collectedCount +

        " / " +

        config.keys;


    hudCoins.textContent =

        "العملات: " +

        coinsCollected;


    hudTime.textContent =

        "الوقت: " +

        getElapsedSeconds();


    var staminaPercent =

        Math.round(

            player.stamina /

            player.staminaMax *

            100

        );


    staminaText.textContent =
        staminaPercent +
        "%";


    staminaFill.style.width =
        staminaPercent +
        "%";

}


// =====================================================
// رسم الخلفية
// =====================================================

function drawMap() {

    var levelTone =

        currentLevel >= 4

            ? "#0d1110"

            : "#111711";


    ctx.fillStyle =
        levelTone;


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    var grid =
        clamp(
            screenMin() *
            0.073,
            38,
            70
        );


    ctx.strokeStyle =
        "rgba(110,130,110,0.055)";


    ctx.lineWidth =
        1;


    var x;
    var y;


    for (
        x = 0;
        x <= canvas.width;
        x += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            x,
            0
        );

        ctx.lineTo(
            x,
            canvas.height
        );

        ctx.stroke();

    }


    for (
        y = 0;
        y <= canvas.height;
        y += grid
    ) {

        ctx.beginPath();

        ctx.moveTo(
            0,
            y
        );

        ctx.lineTo(
            canvas.width,
            y
        );

        ctx.stroke();

    }


    drawFloorMarks();

}


function drawFloorMarks() {

    var i;


    ctx.fillStyle =
        "rgba(255,255,255,0.018)";


    for (
        i = 0;
        i < 18;
        i++
    ) {

        var x =
            (
                i * 173 +
                currentLevel * 47
            ) %
            canvas.width;


        var y =
            (
                i * 97 +
                currentLevel * 61
            ) %
            canvas.height;


        ctx.beginPath();


        ctx.arc(
            x,
            y,
            10 +
            (i % 4) * 6,
            0,
            Math.PI * 2
        );


        ctx.fill();

    }

}


// =====================================================
// رسم الجدران
// =====================================================

function drawWalls() {

    walls.forEach(function (wall) {

        ctx.fillStyle =
            "#1a211c";


        ctx.fillRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );


        ctx.strokeStyle =
            "#303932";


        ctx.lineWidth =
            1;


        ctx.strokeRect(
            wall.x,
            wall.y,
            wall.width,
            wall.height
        );


        ctx.fillStyle =
            "rgba(255,255,255,0.025)";


        ctx.fillRect(
            wall.x + 2,
            wall.y + 2,
            wall.width - 4,
            3
        );

    });

}


// =====================================================
// رسم أماكن الاختباء
// =====================================================

function drawHideSpots() {

    hideSpots.forEach(function (spot) {

        ctx.save();


        ctx.fillStyle =
            "rgba(19,24,21,0.92)";


        ctx.fillRect(
            spot.x,
            spot.y,
            spot.width,
            spot.height
        );


        ctx.strokeStyle =
            "rgba(118,142,122,0.20)";


        ctx.lineWidth =
            2;


        ctx.strokeRect(
            spot.x,
            spot.y,
            spot.width,
            spot.height
        );


        ctx.fillStyle =
            "rgba(0,0,0,0.30)";


        ctx.fillRect(
            spot.x +
            spot.width * 0.18,

            spot.y +
            spot.height * 0.12,

            spot.width * 0.64,

            spot.height * 0.76
        );


        ctx.restore();

    });

}


// =====================================================
// رسم العملات
// =====================================================

function drawCoins() {

    var now =
        performance.now() *
        0.005;


    var px =
        player

            ? player.x +
              player.width / 2

            : 0;


    var py =
        player

            ? player.y +
              player.height / 2

            : 0;


    gameCoins.forEach(function (coin) {

        if (
            coin.collected
        ) {
            return;
        }


        var pulse =

            1 +

            Math.sin(
                now +
                coin.phase
            ) *

            0.12;


        var d =

            player

                ? distance(
                    px,
                    py,
                    coin.x,
                    coin.y
                )

                : 9999;


        var near =

            clamp(
                1 -
                d /
                (
                    screenMin() *
                    0.30
                ),
                0,
                1
            );


        ctx.save();


        ctx.shadowBlur =
           1 +
            near * 7;

        ctx.shadowColor = "#dfbc42";
        ctx.fillStyle = "#caa83f";

   


        ctx.beginPath();


        ctx.arc(
            coin.x,
            coin.y,
            6.5 * pulse,
            0,
            Math.PI * 2
        );


        ctx.fill();


        ctx.fillStyle =
            "rgba(255,255,255,0.30)";


        ctx.fillRect(
            coin.x - 1,
            coin.y - 4,
            2,
            8
        );


        ctx.restore();

    });

}


// =====================================================
// المفاتيح والبلورات
// =====================================================

function drawCollectibles() {

    var now =
        performance.now() *
        0.004;


    collectibles.forEach(function (item) {

        if (
            item.collected
        ) {
            return;
        }


        if (
            item.kind ===
            "crystal"
        ) {

            drawCrystal(
                item,
                now
            );

        } else {

            drawKey(
                item
            );

        }

    });

}


function drawKey(item) {

    var px =
        player

            ? player.x +
              player.width / 2

            : 0;


    var py =
        player

            ? player.y +
              player.height / 2

            : 0;


    var d =

        player

            ? distance(
                px,
                py,
                item.x,
                item.y
            )

            : 9999;


    var near =

        clamp(
            1 -
            d /
            (
                screenMin() *
                0.30
            ),
            0,
            1
        );


    ctx.save();

    ctx.globalAlpha =
        0.06 +
        near * 0.94;

    ctx.shadowBlur =
        near * 6;


    ctx.shadowColor =
        "#ffe46b";


    ctx.fillStyle =
        "#dbc14c";


    ctx.beginPath();


    ctx.arc(
        item.x,
        item.y,
        7,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.fillRect(
        item.x + 5,
        item.y - 2,
        18,
        4
    );


    ctx.fillRect(
        item.x + 15,
        item.y - 2,
        3,
        8
    );


    ctx.fillRect(
        item.x + 20,
        item.y - 2,
        3,
        6
    );


    ctx.restore();

}


function drawCrystal(
    item,
    now
) {

    var bob =

        Math.sin(
            now +
            item.phase
        ) *

        3;


    var px =
        player

            ? player.x +
              player.width / 2

            : 0;


    var py =
        player

            ? player.y +
              player.height / 2

            : 0;


    var d =

        player

            ? distance(
                px,
                py,
                item.x,
                item.y
            )

            : 9999;


    var near =

        clamp(
            1 -
            d /
            (
                screenMin() *
                0.32
            ),
            0,
            1
        );


    ctx.save();

    ctx.translate(
        item.x,
        item.y + bob
        );

    ctx.globalAlpha =
        0.08 +
        near * 0.92;

    ctx.shadowBlur =
        near * 7;

    ctx.shadowColor =
        "#7d6cff";


    ctx.fillStyle =
        "#8b7cff";


    ctx.beginPath();


    ctx.moveTo(
        0,
        -14
    );


    ctx.lineTo(
        9,
        -2
    );


    ctx.lineTo(
        5,
        12
    );


    ctx.lineTo(
        -5,
        12
    );


    ctx.lineTo(
        -9,
        -2
    );


    ctx.closePath();

    ctx.fill();

    ctx.restore();

}


// =====================================================
// رسم الصناديق
// =====================================================

function drawChests() {

    var px =
        player
            ? player.x + player.width / 2
            : 0;

    var py =
        player
            ? player.y + player.height / 2
            : 0;


    chests.forEach(function (chest) {

        var chestX =
            chest.x +
            chest.width / 2;

        var chestY =
            chest.y +
            chest.height / 2;

        var d =
            player
                ? distance(
                    px,
                    py,
                    chestX,
                    chestY
                )
                : 9999;

        var near =
            clamp(
                1 -
                d /
                (
                    screenMin() *
                    0.32
                ),
                0,
                1
            );

        var p =
            clamp(
                chest.opening || 0,
                0,
                1
            );

        var lidLift =
            p *
            chest.height *
            0.34;


        ctx.save();

        ctx.globalAlpha =
            chest.opened
                ? 0.35
                : 0.07 +
                  near * 0.93;


        ctx.fillStyle =

            chest.opened

                ? "#39352d"

                : "#745328";


        ctx.fillRect(
            chest.x,

            chest.y +
            chest.height *
            0.24,

            chest.width,

            chest.height *
            0.76
        );


        ctx.fillStyle =

            chest.opened

                ? "#4b463c"

                : "#b79040";


        ctx.fillRect(
            chest.x,

            chest.y -
            lidLift,

            chest.width,

            chest.height *
            0.30
        );


        if (
            !chest.opened
        ) {

            ctx.fillStyle =
                "#d5bd64";


            ctx.fillRect(
                chest.x +
                chest.width / 2 -
                3,

                chest.y +
                chest.height *
                0.48,

                6,
                7
            );

        }


        if (
            p > 0 &&
            p < 1
        ) {

            ctx.fillStyle =

                "rgba(230,205,105," +

                (
                    p *
                    0.18
                ) +

                ")";


            ctx.beginPath();


            ctx.arc(
                chest.x +
                chest.width / 2,

                chest.y,

                chest.width *
                (
                    0.5 +
                    p * 0.45
                ),

                0,

                Math.PI * 2
            );


            ctx.fill();

        }


        ctx.restore();

    });

}


// =====================================================
// رسم الباب
// =====================================================

function drawDoor() {

    if (!exitDoor) {
        return;
    }


    ctx.save();


    if (
        exitDoor.open
    ) {

        ctx.shadowBlur =
            25;


        ctx.shadowColor =
            "#55df79";


        ctx.fillStyle =
            "#174e2a";

    } else {

        ctx.fillStyle =
            "#3e281a";

    }


    ctx.fillRect(
        exitDoor.x,
        exitDoor.y,
        exitDoor.width,
        exitDoor.height
    );


    ctx.fillStyle =

        exitDoor.open

            ? "#5ed77d"

            : "#76533a";


    ctx.fillRect(
        exitDoor.x + 7,
        exitDoor.y + 7,
        exitDoor.width - 14,
        exitDoor.height - 14
    );


    ctx.fillStyle =
        "#171717";


    ctx.beginPath();


    ctx.arc(
        exitDoor.x +
        exitDoor.width -
        12,

        exitDoor.y +
        exitDoor.height /
        2,

        3,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.restore();

}// =====================================================
// رسم اللاعب
// =====================================================

function drawPlayer() {

    if (!player) {
        return;
    }


    if (
        player.invincible > 0 &&
        Math.floor(
            player.invincible / 5
        ) % 2 === 0
    ) {
        return;
    }


    var cx =
        player.x +
        player.width / 2;


    var bodyY =
        player.y + 15;


    ctx.save();


    if (player.hidden) {

        ctx.globalAlpha =
            0.42;

    }


    ctx.fillStyle =
        "rgba(0,0,0,0.48)";


    ctx.beginPath();


    ctx.ellipse(
        cx,
        player.y +
        player.height +
        4,
        player.width *
        0.52,
        6,
        0,
        0,
        Math.PI * 2
    );


    ctx.fill();


    if (player.shield) {

        ctx.strokeStyle =
            "rgba(100,185,255,0.72)";


        ctx.lineWidth =
            3;


        ctx.beginPath();


        ctx.arc(
            cx,
            player.y +
            player.height / 2,
            player.width *
            0.92,
            0,
            Math.PI * 2
        );


        ctx.stroke();

    }


    var legSwing =
        Math.sin(
            player.walkCycle
        ) *
        3;


    ctx.strokeStyle =
        "#444b47";


    ctx.lineWidth =
        4;


    ctx.lineCap =
        "round";


    ctx.beginPath();


    ctx.moveTo(
        cx - 4,
        player.y +
        player.height -
        8
    );


    ctx.lineTo(
        cx - 5 +
        legSwing,
        player.y +
        player.height +
        1
    );


    ctx.stroke();


    ctx.beginPath();


    ctx.moveTo(
        cx + 4,
        player.y +
        player.height -
        8
    );


    ctx.lineTo(
        cx + 5 -
        legSwing,
        player.y +
        player.height +
        1
    );


    ctx.stroke();


    ctx.fillStyle =
        "#5f6963";


    ctx.fillRect(
        player.x + 5,
        bodyY,
        Math.max(
            10,
            player.width -
            10
        ),
        Math.max(
            13,
            player.height -
            18
        )
    );


    ctx.fillStyle =
        "#cdb7a7";


    ctx.beginPath();


    ctx.arc(
        cx,
        player.y + 10,
        9,
        0,
        Math.PI * 2
    );


    ctx.fill();


    var eyeX =
        clamp(
            player.facingX,
            -1,
            1
        ) *
        1.4;


    var eyeY =
        clamp(
            player.facingY,
            -1,
            1
        ) *
        1.2;


    ctx.fillStyle =
        "#111";


    ctx.beginPath();


    ctx.arc(
        cx - 3 + eyeX,
        player.y +
        9 +
        eyeY,
        1.2,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.beginPath();


    ctx.arc(
        cx + 3 + eyeX,
        player.y +
        9 +
        eyeY,
        1.2,
        0,
        Math.PI * 2
    );


    ctx.fill();


    ctx.restore();

}


// =====================================================
// رسم الوحوش
// =====================================================

function drawMonsters() {

    monsters.forEach(
        function (monster) {

            var cx =
                monster.x +
                monster.width / 2;


            var cy =
                monster.y +
                monster.height / 2;


            ctx.save();


            if (
                monster.active
            ) {

                ctx.shadowBlur =

                    monster.isBoss

                        ? 34

                        : 22;


                ctx.shadowColor =
                    "rgba(180,0,0,0.78)";

            }


            if (
                frozenTimer >
                0
            ) {

                ctx.shadowBlur =
                    20;


                ctx.shadowColor =
                    "#69bfff";

            }


            ctx.fillStyle =

                frozenTimer > 0

                    ? "#1a2e39"

                    : monster.isBoss

                        ? "#0c0505"

                        : "#070807";


            ctx.beginPath();


            ctx.arc(
                cx,
                cy,
                monster.width / 2,
                0,
                Math.PI * 2
            );


            ctx.fill();


            if (
                monster.isBoss
            ) {

                ctx.strokeStyle =
                    "#4a1414";


                ctx.lineWidth =
                    4;


                ctx.beginPath();


                ctx.arc(
                    cx,
                    cy,
                    monster.width *
                    0.36,
                    0,
                    Math.PI * 2
                );


                ctx.stroke();

            }


            ctx.fillStyle =

                frozenTimer > 0

                    ? "#8bceff"

                    : "#c80000";


            var eyeSize =

                monster.isBoss

                    ? 4.2

                    : monster.active

                        ? 3.1

                        : 2.2;


            var eyeOffset =

                monster.isBoss

                    ? 10

                    : 6;


            ctx.beginPath();


            ctx.arc(
                cx -
                eyeOffset,
                cy - 5,
                eyeSize,
                0,
                Math.PI * 2
            );


            ctx.fill();


            ctx.beginPath();


            ctx.arc(
                cx +
                eyeOffset,
                cy - 5,
                eyeSize,
                0,
                Math.PI * 2
            );


            ctx.fill();


            if (
                monster.isBoss
            ) {

                ctx.strokeStyle =
                    "#6a1111";


                ctx.lineWidth =
                    3;


                ctx.beginPath();


                ctx.arc(
                    cx,
                    cy + 10,
                    12,
                    0,
                    Math.PI
                );


                ctx.stroke();

            }


            ctx.restore();

        }
    );

}


// =====================================================
// الظلام
// =====================================================

function drawDarkness() {

    if (!player) {
        return;
    }


    var config =
        levels[currentLevel];


    var upgradeMultiplier =

        1 +

        saveData
            .upgrades
            .light *

        0.10;


    var radius =

        screenMin() *

        config.lightRadius *

        upgradeMultiplier;


    // مجال رؤية أكبر للجوال
    if (
        window.innerWidth <
        1000
    ) {

        radius *=
            1.55;

    }


    if (
        config.flicker
    ) {

        radius *=

            0.90 +

            Math.sin(
                performance.now() *
                0.012
            ) *
            0.05 +

            Math.random() *
            0.04;

    }


    var x =
        player.x +
        player.width / 2;


    var y =
        player.y +
        player.height / 2;


    var gradient =
        ctx.createRadialGradient(
            x,
            y,
            22,
            x,
            y,
            radius
        );


    gradient.addColorStop(
        0,
        "rgba(0,0,0,0)"
    );


    gradient.addColorStop(
        0.38,
        "rgba(0,0,0,0.07)"
    );


    gradient.addColorStop(
        0.70,
        "rgba(0,0,0,0.55)"
    );


    gradient.addColorStop(
        1,
        "rgba(0,0,0,0.92)"
    );


    ctx.fillStyle =
        gradient;


    ctx.fillRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    // احمرار الشاشة أثناء المطاردة
    if (

        chaseIntensity >
        0.02 &&

        !player.hidden

    ) {

        ctx.fillStyle =

            "rgba(120,0,0," +

            (
                0.025 +
                chaseIntensity *
                0.14
            ) +

            ")";


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

    }


    // تحذير اندفاع الزعيم
    monsters.forEach(
        function (monster) {

            if (

                monster.isBoss &&

                monster.dashWarning >
                0

            ) {

                var warningPulse =

                    0.035 +

                    Math.abs(
                        Math.sin(
                            performance.now() *
                            0.02
                        )
                    ) *

                    0.045;


                ctx.fillStyle =

                    "rgba(170,20,20," +

                    warningPulse +

                    ")";


                ctx.fillRect(
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

            }

        }
    );

}


// =====================================================
// اهتزاز الشاشة
// =====================================================

function applyScreenShake() {

    if (
        screenShake <=
        0
    ) {

        return;

    }


    ctx.translate(

        (
            Math.random() -
            0.5
        ) *
        screenShake,

        (
            Math.random() -
            0.5
        ) *
        screenShake

    );


    screenShake *=
        Math.pow(
            0.86,
            frameScale
        );


    if (
        screenShake <
        0.5
    ) {

        screenShake =
            0;

    }

}


// =====================================================
// تحديث اللعبة
// =====================================================

function update() {

    if (

        !gameRunning ||

        gamePaused ||

        gameEnded

    ) {

        return;

    }


    updatePlayer();

    updateMonsters();

    updateChaseEffects();


    checkCollectibles();

    checkCoins();

    checkChests();

    updateChests();

    checkDoor();


    updateHUD();

}


// =====================================================
// الرسم
// =====================================================

function draw() {

    ctx.clearRect(
        0,
        0,
        canvas.width,
        canvas.height
    );


    if (

        !gameRunning &&

        !gameEnded

    ) {

        ctx.fillStyle =
            "#050705";


        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );


        return;

    }


    ctx.save();


    applyScreenShake();


    drawMap();

    drawWalls();

    drawHideSpots();

    drawCoins();

    drawCollectibles();

    drawChests();

    drawDoor();

    drawMonsters();

    drawPlayer();

    drawDarkness();


    ctx.restore();

}


// =====================================================
// Game Loop
// =====================================================

function gameLoop(time) {

    if (
        !lastFrameTime
    ) {

        lastFrameTime =
            time;

    }


    var delta =

        time -

        lastFrameTime;


    lastFrameTime =
        time;


    frameScale =
        clamp(
            delta /
            16.6667,
            0.45,
            2.5
        );


    update();

    draw();


    requestAnimationFrame(
        gameLoop
    );

}


// =====================================================
// تشغيل اللعبة
// =====================================================

updateMenus();

showMainMenu();

requestAnimationFrame(
    gameLoop
);