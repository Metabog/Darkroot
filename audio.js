//https://www.beepbox.co/#9n31sbk0l00e0bt2ma7g0fj07r3i0o245T1v0u16f0q00d03A0F0B0Q0000Pff00E1617T1v1u01f0q803d23A0F0B0Q0000Pf600E1617T0v0u00f10u7qM022d04w3h0E108T2v4u02f0q0x10p70d0aw0E1bib4xci4N8j0000018j4xc0014h4hkz90004hgz8Ocz000p269FEZ8hQ9H-2exdjF2X6-hQsEhQp17hJ2X17y0J0La4t6MhQrgKMhVgGCnQYq2CzNNvh0S9HY5nbRQv0aqfCFjkZuYjn_kQv8LEGHPeoSY5dvPlWUnQnnpODnbNyqfCCXMgHK09uCb9jkEdhemz91A4591ogp4BALtz4EcEkGAyZcnpG9OUIwO22AwH84Qvp7b-bGCNyk6kajbdvMCPhX87hXdv2OPhP05g3vd8kLjgggk24Dmw0ld7PkDwW42jgs4R1cUdvgPhjascld6gCRM5d6ipqNInHRWB_eur2SyEBc5whkRVSkaCz88W5d6EPeKGuZm5K5VMmUnDJUnr5lO-fahaqcDLlsLFZ_0dkOB35jhA9JsNd6ihGqDHNapj1kOI2Q2FBU50

let song;

let shootsfx = null
let damagesfx = null
let explosfx = null

let pickupsounds=[]

let wooshes=[]
let lands=[]
let powerupsfx = null
let winsound = null

let rootcollects = []
let noChargeSfx = null

function playSoundSpatial(sound,x,y)
{
    let d = dist(player.body.x,player.body.y,x,y)
    d*=0.05

    sound.volume = min(1.0/d,1.0)
    sound.play()
}

function setupAudio()
{
    pickupsounds = []

    soundFormats('mp3', 'ogg', 'wav');
    song = new Audio('Data/Audio/Rootsong.mp3')
    shootsfx = new Audio('Data/Audio/laserShoot.wav')
    damagesfx = new Audio('Data/Audio/hitHurt.wav')
    damagesfx.volume=0.5

    explosfx = new Audio('Data/Audio/explosion.wav')
    explosfx.volume =0.6

    song.loop=true
    song.volume=0.7
    music_started = false

    pickupsounds.push(new Audio('Data/Audio/pickupCoin.wav'))
    pickupsounds.push(new Audio('Data/Audio/pickupCoin2.wav'))
    pickupsounds.push(new Audio('Data/Audio/pickupCoin3.wav'))
    pickupsounds.push(new Audio('Data/Audio/pickupCoin4.wav'))

    wooshes.push(new Audio('Data/Audio/woosh.wav'))
    wooshes.push(new Audio('Data/Audio/woosh.wav'))
    wooshes.push(new Audio('Data/Audio/woosh.wav'))
    wooshes.push(new Audio('Data/Audio/woosh.wav'))

    lands.push(new Audio('Data/Audio/land.wav'))
    lands.push(new Audio('Data/Audio/land.wav'))
    lands.push(new Audio('Data/Audio/land.wav'))
    lands.push(new Audio('Data/Audio/land.wav'))

    rootcollects.push(new Audio('Data/Audio/rootcollect.wav'))
    rootcollects.push(new Audio('Data/Audio/rootcollect.wav'))
    rootcollects.push(new Audio('Data/Audio/rootcollect.wav'))
    rootcollects.push(new Audio('Data/Audio/rootcollect.wav'))

    powerupsfx = new Audio('Data/Audio/powerUp.wav')
    powerupsfx.volume=0.9

    winsound = new Audio('Data/Audio/winsound.wav')
    winsound.volume = 0.9

    for(let w of wooshes)
    {
      w.volume = 0.5
    }

    for(let r of rootcollects)
    {
      r.volume = 0.7
    }

    noChargeSfx = new Audio('Data/Audio/noCharge.wav')
}

let music_started = false

function playMusic()
{
    //if(!music_started)
    //{
      song.play()
      song.currentTime = 0
      //music_started=true
    //}
}