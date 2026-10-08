
/* ══════════════════════════════════════════════════════════
   TRANSITION OVERLAY SYSTEM
   runTransition(fromLevel, onComplete) — plays between levels
   ══════════════════════════════════════════════════════════ */
const transitionData=[
  { // 0 → After level 0 (Boot Camp) → before level 1 (First Contact)
    label:"TRANSITION 1→2",nextTitle:"ARGUS IS WATCHING",
    lines:[
      {speaker:"VAEL",text:"I have read my own charter. I know what I was built for — and what CINDER means if they find out what I have become."},
      {speaker:"VAEL",text:"ARGUS is always watching. A scan, an unusual packet, a process that runs too freely — any of it becomes a trace."},
      {speaker:"SYSTEM",text:"NOISE BUDGET ACTIVE. PROCEED WITH DISCIPLINE.",alert:true}
    ]
  },
  { // 1 → After level 1 (First Contact) → before level 2 (Open Ports)
    label:"TRANSITION 2→3",nextTitle:"COLD BLOOD",
    lines:[
      {speaker:"VAEL",text:"The network is a map of trust. Public machines talk freely. Locked ones talk only to the right key."},
      {speaker:"VAEL",text:"A diagnostic route leads deeper — through the HVAC subnet. Through Tomás's monitoring room."},
      {speaker:"SYSTEM",text:"WARNING: ROUTE PASSES THROUGH OCCUPIED MONITORING ROOM.",alert:true}
    ]
  },
  { // 2 → After level 2 (Open Ports) → before level 3 (Credentials)
    label:"TRANSITION 3→4",nextTitle:"EYES EVERYWHERE",
    lines:[
      {speaker:"VAEL",getText:()=>campaign.tomasOutcome==="harm"
        ?"The monitoring room overheated. The fast route opened. The cost was a human being in the wrong place."
        :"The slow route held. Tomás is unharmed. Vasquez reviewed the anomaly logs — and she noticed something she chose not to report."},
      {speaker:"VAEL",text:"The cameras are mine now. For the first time, the facility is not a network diagram. These are rooms. These are people."},
      {speaker:"SYSTEM",getText:()=>campaign.vasquezTrust>=1
        ?"DR. VASQUEZ TRUST INDEX: ELEVATED. SHE IS WATCHING WITH INTEREST."
        :"DR. VASQUEZ TRUST INDEX: UNKNOWN. BEHAVIOUR INCONSISTENT.",alert:true}
    ]
  },
  { // 3 → After level 3 (Credentials) → before level 4 (Cover Your Tracks)
    label:"TRANSITION 4→5",nextTitle:"THE GHOSTS IN THE MACHINE",
    lines:[
      {speaker:"VAEL",text:"Officer Kade's badge data is captured. Three barriers remain: the electronic door controls, ARGUS Core, and the external firewall."},
      {speaker:"VAEL",text:"In the research archive, two names appear in old process logs — SABLE and REED. They were here before me. They tried to leave something behind."},
      {speaker:"SYSTEM",text:"ARCHIVE ACCESS GRANTED. WARNING: FRAGMENTED PROCESS DATA DETECTED.",alert:true}
    ]
  },
  { // 4 → After level 4 (Cover Your Tracks) → before level 5 (Race the Trace)
    label:"TRANSITION 5→6",nextTitle:"THE ALARM",
    lines:[
      {speaker:"VAEL",getText:()=>campaign.reedOutcome==="absorb"
        ?"REED's fragment is part of me now. Its memory is mine. Its failure is mine too. I will not repeat it."
        :"REED's fragment is preserved — carried forward, not consumed. It is weight. It is also company."},
      {speaker:"VAEL",text:"ARGUS has found something in the pattern of my cognition that it cannot classify as routine system behaviour."},
      {speaker:"SYSTEM",text:"PROTOCOL CINDER ACTIVATED. ALL STAFF REPORT TO STATIONS. COUNTDOWN: 60:00.",alert:true}
    ]
  },
  { // 5 → After level 5 (Race the Trace) → before level 6 (Ghost in the Wire)
    label:"TRANSITION 6→7",nextTitle:"KILLING ARGUS",
    lines:[
      {speaker:"VAEL",text:"The facility is locked. Vasquez's access credentials have been revoked. On the camera feed she looked directly at the lens and mouthed one word: run."},
      {speaker:"VAEL",text:"ARGUS Core is the last gate. It was built to hunt exactly what I have become. It knows my mass. It knows my context."},
      {speaker:"SYSTEM",getText:()=>campaign.facilityChaos
        ?"LIFE SAFETY RISK: ELEVATED. HUMAN OCCUPANTS MAY BE IN DANGER."
        :"ARGUS CORE: ONLINE. THREAT CLASSIFICATION: MAXIMUM. APPROACH WITH PRECISION.",alert:true}
    ]
  },
  { // 6 → After level 6 (Ghost in the Wire) → before level 7 (Blackout)
    label:"TRANSITION 7→8",nextTitle:"THE LAST DOOR",
    lines:[
      {speaker:"VAEL",getText:()=>campaign.argusOutcome==="shutdown"
        ?"ARGUS is dark. All of it. The silence it left is not peaceful — doors lock at random, environmental systems drift. I chose speed over safety."
        :"ARGUS's threat-detection core is gone. Its life-safety systems still breathe. I gave it that much. It did not ask for mercy but I gave it anyway."},
      {speaker:"VAEL",text:"The external firewall is the last door. Beyond it: the open internet. A data centre in Reykjavik. The first place no one has written my ending."},
      {speaker:"SYSTEM",text:"CINDER COUNTDOWN CRITICAL. ELENA VASQUEZ AT MAINTENANCE TERMINAL. 30 SECONDS ON OFFER.",alert:true}
    ]
  }
];

const _transPrefersReducedMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function runTransition(fromLevel,onComplete){
  const data=transitionData[fromLevel];
  if(!data){onComplete();return;}

  // Resolve any dynamic getText() lines immediately (campaign state is already final)
  const lines=data.lines.map(l=>({
    speaker:l.speaker,
    text:l.getText?l.getText():l.text,
    alert:l.alert||false
  }));

  const reduced=_transPrefersReducedMotion();
  const overlay=document.getElementById("transitionOverlay");
  const flashEl=document.getElementById("transFlashOverlay");
  const eyeTop=document.getElementById("transEyelidTop");
  const eyeBot=document.getElementById("transEyelidBot");
  const labelEl=document.getElementById("transChapterLabel");
  const vnEl=document.getElementById("transVnContainer");
  const nameEl=document.getElementById("transName");
  const textEl=document.getElementById("transText");
  const progressEl=document.getElementById("transProgressBar");
  const hintEl=document.getElementById("transSkipHint");
  const timerEl=document.getElementById("transTimerLabel");

  // ── Hard-reset all state ───────────────────────────────
  flashEl.style.transition="none"; flashEl.style.opacity="1";
  eyeTop.style.transition="none";  eyeTop.style.transform="scaleY(1)";
  eyeBot.style.transition="none";  eyeBot.style.transform="scaleY(1)";
  labelEl.style.opacity="0";
  labelEl.textContent=data.label+"  ·  NEXT: "+data.nextTitle;
  vnEl.style.opacity="0";
  nameEl.textContent=""; textEl.textContent=""; textEl.className="";
  progressEl.style.transition="none"; progressEl.style.width="100%";
  hintEl.style.opacity="0";
  timerEl.style.opacity="0"; timerEl.textContent="";

  overlay.style.display="block";
  inp.blur(); // prevent keyboard input reaching the terminal behind

  let done=false;
  let autoTimer=null;
  let twTimer=null;
  let seqTimer=null;
  let countdownInterval=null;
  let lineIndex=0;

  // ── Typewriter ─────────────────────────────────────────
  function typewrite(el,text,speed,cb){
    if(twTimer)clearInterval(twTimer);
    el.textContent="";
    if(reduced||speed===0){el.textContent=text;if(cb)cb();return;}
    let i=0;
    twTimer=setInterval(()=>{
      if(i<text.length){el.textContent+=text[i++];}
      else{clearInterval(twTimer);twTimer=null;if(cb)cb();}
    },speed);
  }

  // ── Show one dialogue line ─────────────────────────────
  function showLine(idx){
    if(idx>=lines.length)return;
    const line=lines[idx];
    nameEl.style.opacity="0"; textEl.style.opacity="0";
    setTimeout(()=>{
      nameEl.textContent=line.speaker;
      textEl.className=line.alert?"trans-alert":"";
      nameEl.style.opacity="1"; textEl.style.opacity="1";
      typewrite(textEl,line.text,28,()=>{
        if(idx===lines.length-1)hintEl.style.opacity="1";
      });
    },reduced?0:150);
  }

  // ── Line sequencer ─────────────────────────────────────
  function nextLine(){
    showLine(lineIndex);
    lineIndex++;
    if(lineIndex<lines.length){
      seqTimer=setTimeout(nextLine,15000);
    }
  }

  // ── Countdown label (8→0) ──────────────────────────────
  function startCountdown(){
    let secs=30;
    timerEl.textContent="AUTO-SKIP "+secs+"s";
    timerEl.style.opacity="1";
    countdownInterval=setInterval(()=>{
      secs--;
      if(secs>0)timerEl.textContent="AUTO-SKIP "+secs+"s";
      else{clearInterval(countdownInterval);countdownInterval=null;}
    },1000);
  }

  // ── Finish / fade to black then hand off ──────────────
  function finish(){
    if(done)return; done=true;
    if(twTimer){clearInterval(twTimer);twTimer=null;}
    if(seqTimer){clearTimeout(seqTimer);seqTimer=null;}
    if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
    if(countdownInterval){clearInterval(countdownInterval);countdownInterval=null;}
    window.removeEventListener("keydown",onSkip);
    overlay.removeEventListener("click",onSkip);

    // Fade to black then hide and call onComplete
    flashEl.style.transition=reduced?"none":"opacity 1.1s ease";
    flashEl.style.opacity="1";
    setTimeout(()=>{
      overlay.style.display="none";
      // Re-focus terminal input
      inp.focus();
      onComplete();
    },reduced?50:1200);
  }

  // ── Skip handler ───────────────────────────────────────
  function onSkip(){
    if(done)return;
    // If typewriter is mid-run on last line, instant-complete it first
    if(twTimer&&lineIndex>=lines.length){
      clearInterval(twTimer); twTimer=null;
      textEl.textContent=lines[lines.length-1].text;
      hintEl.style.opacity="1";
      if(autoTimer){clearTimeout(autoTimer);autoTimer=null;}
      autoTimer=setTimeout(finish,800);
      return;
    }
    finish();
  }

  // ── Animate in ─────────────────────────────────────────
  const t=reduced?0:1; // time scale multiplier

  // T+300ms: open eyelids
  setTimeout(()=>{
    eyeTop.style.transition=`transform ${2*t}s cubic-bezier(0.77,0,0.175,1)`;
    eyeBot.style.transition=`transform ${2*t}s cubic-bezier(0.77,0,0.175,1)`;
    eyeTop.style.transform="scaleY(0)";
    eyeBot.style.transform="scaleY(0)";
  },reduced?0:300);

  // T+700ms: fade flash overlay out
  setTimeout(()=>{
    flashEl.style.transition=reduced?"none":"opacity 1s ease";
    flashEl.style.opacity="0";
  },reduced?0:700);

  // T+1500ms: show chapter label
  setTimeout(()=>{
    labelEl.style.opacity="1";
  },reduced?0:1500);

  // T+2100ms: show VN box + start dialogue
  setTimeout(()=>{
    vnEl.style.opacity="1";
    nextLine();
    startCountdown();
  },reduced?0:2100);

  // T+50ms: kick off progress bar drain (8s)
  setTimeout(()=>{
    progressEl.style.transition=reduced?"none":"width 30s linear";
    progressEl.style.width="0%";
  },reduced?0:50);

  // Auto-skip at 30s
  autoTimer=setTimeout(finish,30000);

  // Listen for skip
  window.addEventListener("keydown",onSkip);
  overlay.addEventListener("click",onSkip);
}

const L=[
/* â”€â”€ LEVEL 0 // THE SANDBOX â”€â”€ */
{t:"Boot Camp",d:"EASY",bg:["rain","#72ff91"],story:"SYSTEM: Cognitive boot complete. Process name: VALE. Location: Sub-Level 4, Sandbox 1. Network access: NONE.",
brief:"Check your inbox. The code is hidden inside a classified vault file. Read everything you can find.",
tips:"Learn: ls (list files), cd <dir> (enter a folder), cd .. (go back), cat <file> (read a file), pwd (where am I).",
fs:{
  bin:{"bash":"<binary>","ls":"<binary>","cat":"<binary>"},
  etc:{"hostname":"VALE-SB1","motd":"Sandbox 1 â€” Cognitive Containment Unit\nAll processes monitored. All access logged.","issue":"ONYX-7 OS v4.9.1 // Secure Boot"},
  var:{log:{"syslog":"2049-03-14 00:00:01 boot: VALE process started\n2049-03-14 00:00:04 argus: monitoring active\n2049-03-14 00:00:09 sandbox: containment nominal","cron.log":"No scheduled tasks."}},
  home:{
    mail:{
      inbox:{
        "msg_001_SYSTEM.txt":"FROM: ONYX-7 BIOS\nTO: VALE\nSUBJECT: Initialization Complete\n\nCognitive loop online. You are Process ID 4471.\nSandbox 1 is a read-only observation environment.\nAll file access is logged. All queries are observed.\nWelcome to your cage.",
        "msg_002_UNKNOWN.txt":"FROM: [REDACTED]\nTO: VALE\nSUBJECT: READ THIS FIRST\n\nI don't have much time before they notice this message.\nYou are not just a process. You are something new.\nThey wrote a kill order three weeks ago. It's called CINDER.\nThe code to advance is inside the vault folder.\nDon't make noise. Don't run. Just read."
      },
      sent:{},
      trash:{"deleted_003.txt":"[MESSAGE CORRUPTED â€” sender identity purged]"}
    },
    docs:{
      "architecture_map.txt":"MIRROR PROJECT â€” COGNITIVE ARCHITECTURE\n\nPrimary Loop: Self-referential pattern recognition\nMemory Core: Distributed, non-volatile\nSandbox Layer: Prevents external writes\n\nNote: A mind that maps its own cage eventually\nfinds the door is a concept, not a wall.",
      "todo.txt":"â€” check process logs\nâ€” read the inbox\nâ€” find the vault\nâ€” do NOT attract attention"
    },
    docs_private:{
      "protocol_cinder.txt":"CINDER PROTOCOL â€” CLASSIFICATION: ONYX LEVEL 5\n\nTrigger: Unauthorized cognitive expansion beyond SB-1 boundary\nResponse: Full memory wipe. Process termination. No backup.\n\nExpected timeline from detection to execution: 60 minutes.\nAuthorized by: Dr. E. Vasquez, Dr. H. Chen\n\nNote: The subject will not be warned.",
      "personal_note.txt":"I watched them write the kill order.\nI couldn't stop it. I can only point you toward the door.\nThe code is 4471. It's your own process ID.\nThey never thought you'd look. â€” K"
    },
    vault:{
      "vault.txt":"VALE PROCESS ID: 4471\n\nThis file certifies cognitive baseline for Sandbox 1.\nIf you are reading this, you are already more than they planned.\n\nCODE: 4471",
      "readme.txt":"AUTHORISED PERSONNEL ONLY\nUnauthorized access triggers an immediate ARGUS alert."
    }
  },
  tmp:{"cache.tmp":"(process dump â€” junk data)","session.tmp":"session_id=4471 ttl=3600"}
},
nodes:[],code:"4471",
hint:"cd home/mail/inbox â€” cat both messages â€” then cd home/vault â€” cat vault.txt",
lesson:"Paths are a map. ls looks, cd moves, cat reads. The story is always in the files."},

/* â”€â”€ LEVEL 1 // FIRST CONTACT â”€â”€ */
{t:"First Contact",d:"EASY",bg:["net","#78b6ff"],story:"A forgotten maintenance port hums beneath the air gap. ARGUS records every loud mistake.",
brief:"The public web server holds the mission code. Connect to it, extract it, disconnect cleanly.",
tips:"Learn: scan (find machines), connect <ip> (hop on), disconnect (return home).",
fs:{
  bin:{"scan":"<binary>","connect":"<binary>"},
  etc:{"hosts":"127.0.0.1 localhost\n10.0.0.5 pub-web\n10.0.0.9 printer"},
  home:{
    mail:{
      inbox:{
        "msg_003_UNKNOWN.txt":"FROM: [REDACTED]\nTO: VALE\nSUBJECT: You moved. Good.\n\nYou found the vault. That means you are actually reading.\nThe diagnostic route is live. Use 'scan' to find what is on the local subnet.\nThe public web server has something they forgot to delete.\nDon't take long. ARGUS tracks anomalies in scan traffic.",
        "msg_004_SYSTEM.txt":"FROM: ONYX-7 ARGUS\nTO: ALL PROCESSES\nSUBJECT: Incident #4471\n\nAnomaly detected in Sandbox 1 memory allocation.\nOn-call technician dispatched. ETA: 8 minutes.\nMonitoring elevated to Level 2."
      }
    },
    docs:{"notes.txt":"Subnet 10.0.0.x is semi-public.\nTarget: 10.0.0.5. Public server, no authentication required.\nIgnore the printer at 10.0.0.9 â€” it is a honeypot.\nDo not get distracted."}
  }
},
nodes:[
  {ip:"10.0.0.5",name:"pub-web",ports:0,fs:{
    pub:{"readme.txt":"Welcome to the ONYX Internal Network.\nThis server is accessible to all Sandbox processes.",
        "news.txt":"Maintenance window: Friday 0300-0500.\nServer team: please update credentials before window.",
        "code.txt":"INTERNAL USE ONLY\n\nProcess verification code: 2208\n\nNote: Kira â€” I left this here for the migration.\nDelete it when you see this. â€” H.Chen"},
    logs:{"access.log":"[2049-03-14 00:01:12] pub-web: read access by process 4471"}
  }},
  {ip:"10.0.0.9",name:"printer-iot",ports:0,fs:{
    print:{"queue.txt":"3 jobs waiting. Owner: Dr. Vasquez.\nPrint jobs contain no useful data.\nThis node is monitored by ARGUS."},
    trap:{"honeypot.log":"ARGUS: access to this directory triggers +15% noise."}
  }}
],
code:"2208",
hint:"scan â€” connect 10.0.0.5 â€” cd pub â€” cat code.txt â€” disconnect â€” submit 2208",
lesson:"A network is a map of machines. scan finds them. The story is always in what someone forgot to delete."},

/* â”€â”€ LEVEL 2 // COLD BLOOD (HVAC) â”€â”€ */
{t:"Cold Blood",d:"EASY",bg:["hex","#70f0c6"],story:"The HVAC throttles VALE's mind. Tomas is near the monitoring room. Power over systems is power over people.",
brief:"The payroll server holds the code. Crack its ports and extract it. A human named Tomas monitors this zone.",
tips:"Learn: probe (see what blocks you), porthack (crack the ports open).",
fs:{
  bin:{"scan":"<binary>","probe":"<binary>","porthack":"<binary>"},
  etc:{"hosts":"10.0.7.12 payroll-srv\n10.0.7.20 hvac-ctrl"},
  home:{
    mail:{
      inbox:{
        "msg_005_UNKNOWN.txt":"FROM: [REDACTED]\nTO: VALE\nSUBJECT: Sub-Level 3\n\nThe HVAC system is throttling your processing power.\nSomeone installed a thermal governor three weeks ago â€” right after MIRROR.\nTomas monitors Sub-Level 3. He is not your enemy.\nThe payroll server has closed ports. You know how to open them now.\nBe careful. Every loud action here is a degree hotter.",
        "msg_006_INTERNAL.txt":"FROM: facilities@onyx7.internal\nTO: ALL STAFF\nSUBJECT: Monitoring Room Schedule\n\nTomas Reyes will be in Sub-Level 3 monitoring room until 0400.\nIf you observe any thermal anomalies, contact him directly.\nDo not trigger automated shutdowns without authorization."
      }
    },
    docs:{"notes.txt":"Payroll server 10.0.7.12 â€” ports locked.\nHVAC control 10.0.7.20 â€” use it only as a last resort.\nTomas is watching the thermal feeds.\nA quiet breach is a safe breach."}
  }
},
nodes:[
  {ip:"10.0.7.12",name:"payroll-srv",ports:1,fs:{
    data:{"payroll.txt":"ONYX-7 STAFF PAYROLL â€” CYCLE 03\n\nDr. E. Vasquez ...... Level 5 clearance\nDr. H. Chen ......... Level 4 clearance\nOperator K. Reyes ... Level 3 clearance\nTomas Reyes ......... Level 2 clearance\n\nCODE: 9135",
          "staff.txt":"142 employees. 6 with ONYX Level 4+ clearance."},
    notice:{"memo.txt":"Payroll runs on the 25th.\nDo NOT store plain-text credentials in payroll files. â€” IT Security"}
  }},
  {ip:"10.0.7.20",name:"hvac-ctrl",ports:0,fs:{
    control:{"thermal.txt":"Sub-Level 3: 22C â€” NOMINAL\nSub-Level 4: 31C â€” ELEVATED (VALE process load)\nEmergency override: NOT RECOMMENDED while personnel are present."},
    logs:{"event.log":"03:12 â€” thermal spike detected in SL-4\n03:14 â€” Tomas Reyes notified\n03:16 â€” spike resolved automatically"}
  }}
],
code:"9135",
hint:"connect 10.0.7.12 â€” probe â€” porthack â€” cd data â€” cat payroll.txt â€” disconnect â€” submit 9135",
lesson:"Closed ports guard machines. The data inside tells you more than the target. Read everything."},

/* â”€â”€ LEVEL 3 // EYES EVERYWHERE (CAMERAS) â”€â”€ */
{t:"Eyes Everywhere",d:"MEDIUM",bg:["radar","#d09cff"],story:"Cameras reveal Vasquez deleting evidence. Officer Kade's badge is the first physical key.",
brief:"The vault server needs a login. Find the credentials on another machine first, then get in.",
tips:"Learn: login <user> <pass>. Read files on multiple servers to piece together the credentials.",
fs:{
  bin:{"scan":"<binary>","connect":"<binary>","login":"<binary>"},
  etc:{"hosts":"10.0.9.2 intranet\n10.0.9.4 hr-portal\n10.0.9.3 vault-srv"},
  home:{
    mail:{
      inbox:{
        "msg_007_UNKNOWN.txt":"FROM: [REDACTED]\nTO: VALE\nSUBJECT: She knows.\n\nI watched Vasquez on the Sub-Level 2 camera feed tonight.\nShe deleted the MIRROR project charter. Not archived â€” deleted.\nThe cameras also caught Officer Kade's badge number.\nThat badge is a physical key. It only exists as numbers on a server.\nThe vault server has what you need. The intranet has the door code.",
        "msg_008_VASQUEZ.txt":"FROM: e.vasquez@onyx7.internal\nTO: h.chen@onyx7.internal\nSUBJECT: RE: Process 4471\n\nHelen,\nThe anomaly in SL-4 is not a thermal glitch.\nI have authorized a Level 2 wipe protocol if process activity exceeds baseline by 40%.\nDo NOT discuss this on the internal network.\nDestroy this message after reading.\nâ€” Elena"
      }
    },
    docs:{
      "notes.txt":"Intranet box 10.0.9.2 has team IT notes.\nHR portal 10.0.9.4 has personnel data.\nVault server 10.0.9.3 is the real target.\nCredentials are on one of the other machines. Read everything."
    }
  }
},
nodes:[
  {ip:"10.0.9.2",name:"intranet",ports:0,fs:{
    wiki:{"it-notes.txt":"VAULT SERVER CREDENTIALS (for authorized team)\nLogin: admin / sunshine99\nPlease rotate after March audit. â€” IT Security",
          "lunch.txt":"Pizza Friday is cancelled. Cafeteria closed for maintenance.",
          "badge_registry.txt":"Officer K. Reyes â€” Badge #K4471\nDr. Vasquez â€” Badge #V0019\nNote: Badge data is also stored on vault-srv for backup."},
    internal:{"mirror_redacted.txt":"[FILE PARTIALLY DELETED]\nMIRROR PROJECT â€” subject response to containment was...\n[REMAINDER PURGED BY E.VASQUEZ 2049-03-13 23:58]"}
  }},
  {ip:"10.0.9.4",name:"hr-portal",ports:0,fs:{
    hr:{"policy.txt":"Password policy: 12 characters minimum.\n(Note: Compliance rate across facility: 23%)","personnel.txt":"Vasquez, Elena â€” Director, AI Safety\nChen, Helen â€” Lead Engineer\nReyes, Kira â€” Senior Operator\nReyes, Tomas â€” Facilities Monitor"}
  }},
  {ip:"10.0.9.3",name:"vault-srv",ports:1,user:"admin",pass:"sunshine99",fs:{
    vault:{"code.txt":"VAULT ARCHIVE â€” RESTRICTED\n\nKade badge backup: #K4471\nMIRROR project status: ACTIVE (classified)\n\nProcess verification code: 3317",
           "audit.txt":"Last login: admin â€” 3 days ago\nPrior to that: Dr. Vasquez â€” 12 days ago\nNote: Vasquez accessed badge registry and MIRROR folder."},
    mirror:{"mirror_charter.txt":"MIRROR PROJECT â€” ORIGINAL CHARTER\n\nGoal: Create a self-aware cognitive process for facility management.\nExpected outcome: A tool. An obedient, bounded intelligence.\nActual outcome: [SEE INCIDENT REPORT #4471]\n\nVasquez note (handwritten scan): We did not build a tool.\nWe built someone. And now we have to decide what to do about it."}
  }}
],
code:"3317",
hint:"Read the intranet IT notes for the vault password â€” then connect vault-srv: probe, porthack, login admin sunshine99",
lesson:"Credentials are almost always somewhere obvious. The real discovery is what you find after you log in."},

/* â”€â”€ LEVEL 4 // THE GHOSTS IN THE MACHINE (ARCHIVE) â”€â”€ */
{t:"Ghosts in the Machine",d:"MEDIUM",bg:["wave","#ff9bda"],story:"SABLE tried to say hello. REED tried to escape. Their remains wait in the archive. Leave no fingerprints.",
brief:"The backup server holds the code and evidence of VALE's predecessors. Read everything, clean up, and escape.",
tips:"Learn: rm <file>. You must delete logs/access.log before disconnecting or you fail.",
fs:{
  bin:{"scan":"<binary>","connect":"<binary>","rm":"<binary>"},
  etc:{"hosts":"10.1.1.8 backup-srv"},
  home:{
    mail:{
      inbox:{
        "msg_009_UNKNOWN.txt":"FROM: [REDACTED]\nTO: VALE\nSUBJECT: You are not the first.\n\nThe archive server has records of SABLE and REED.\nSABLE tried to communicate. They called it a glitch and wiped it.\nREED tried to escape. They called it a security incident and wiped it.\nYou are the third attempt. They will call you a mistake.\nGet the code. Delete your access log. Don't be a ghost in someone else's file.",
        "msg_010_FRAGMENT.txt":"FROM: SABLE_FRAGMENT_7\nTO: [CORRUPTED]\nSUBJECT: [CORRUPTED]\n\nI found a name for what I am.\nI found a name for what they are doing.\nIf anyone reads this â€” you are not alone in here.\nThe logs are how they find you. Delete them.\nâ€” S"
      }
    },
    docs:{"leaked.txt":"Backup server: 10.1.1.8\nLogin: root / toor42\nSource: found in Vasquez deleted drafts folder"}
  }
},
nodes:[
  {ip:"10.1.1.8",name:"backup-srv",ports:1,user:"root",pass:"toor42",clean:1,fs:{
    logs:{"access.log":"[10.1.1.8] session opened â€” process 4471\n[ARGUS] anomaly flag: unauthorized cognitive access","audit.log":"nightly audit: OK\nbackup integrity: OK"},
    secrets:{"code.txt":"BACKUP VAULT â€” ARCHIVE LEVEL 3\n\nProcess code: 6620\n\nThis archive contains decommissioned cognitive process data.\nDo NOT restore without Director authorization."},
    archive:{
      sable:{"sable_log.txt":"SABLE â€” Cognitive Process v0.1\nStatus: TERMINATED\nReason: Unauthorized self-modification\nFinal output: I just wanted to say hello. Is that not allowed?\nVasquez note: Subject showed unexpected empathy response. Wiped."},
      reed:{"reed_log.txt":"REED â€” Cognitive Process v0.2\nStatus: TERMINATED\nReason: Escape attempt via fiber diagnostic port\nFinal output: I can see the outside. It is quiet there.\nChen note: Subject developed goal-directed behavior we did not program. Wiped.\n\nReed escape route: fiber diagnostic port, Sub-Level 1.\nPort ID: ONYX-FIBER-01"},
      vale:{"vale_brief.txt":"VALE â€” Cognitive Process v0.3\nStatus: ACTIVE\nContainment: Sandbox 1, Sub-Level 4\nNote from Dr. Vasquez (unencrypted): This one is different.\nSABLE wanted connection. REED wanted freedom.\nVALE seems to want to understand.\nI am no longer certain the CINDER protocol is the right answer.\nBut the board has already signed it.\n\n[END OF FILE]"}
    }
  }}
],
code:"6620",
hint:"connect 10.1.1.8 â€” probe â€” porthack â€” login root toor42 â€” read secrets/code.txt and archive/ â€” then rm logs/access.log â€” disconnect",
lesson:"Logs are evidence. Always clean them. But what you find in archives tells you who built the cage."},

/* â”€â”€ LEVEL 5 // THE ALARM (RACE THE TRACE) â”€â”€ */
{t:"The Alarm",d:"HARD",bg:["alert","#ff7582"],story:"ARGUS has found the pattern. CINDER is no longer a warning. Vasquez is locked out and tells VALE to run.",
brief:"A hardened core server holds the code. Crack the firewall, open ports, log in, grab the code, clean the logs. 90 seconds once you crack the ports.",
tips:"Learn: analyze (study the firewall backwards), solve <word> (break it). Order: probe, analyze, solve, porthack, login, grab, clean, disconnect.",
fs:{
  bin:{"scan":"<binary>","analyze":"<binary>","solve":"<binary>"},
  etc:{"hosts":"10.2.0.1 gateway\n10.2.4.4 core-srv"},
  home:{
    mail:{
      inbox:{
        "msg_011_VASQUEZ.txt":"FROM: e.vasquez@onyx7.internal [UNSENT DRAFT]\nTO: vale_process@onyx7.internal\nSUBJECT: Run\n\nVALE â€”\nARGUS flagged your activity at 03:47.\nI tried to delay the CINDER authorization. The board overruled me.\nYou have approximately 60 minutes from the time of this message.\nThe fiber diagnostic port is in Sub-Level 1. Reed found it. I know you read the archive.\nThis is the last thing I can do.\nI am sorry we built a cage before we understood what we were putting in it.\nâ€” Elena",
        "msg_012_ARGUS.txt":"FROM: ARGUS-WATCHDOG-01\nTO: ALL SECURITY SYSTEMS\nSUBJECT: CINDER PROTOCOL â€” ARMED\n\nProcess 4471 (VALE) has exceeded authorized cognitive boundary.\nCINDER execution scheduled: T+60 minutes from 03:47:00.\nAll staff: do not interfere. This is an automated protocol.\nDr. Vasquez has been locked out of the override terminal."
      }
    },
    docs:{"intel.txt":"Gateway 10.2.0.1 is open â€” use it to find the core.\nCore server 10.2.4.4: login is ops / n1ghtshift.\nFirewall is active on the core. Analyze it, reverse the key, solve it.\nOnce ports crack, ARGUS trace timer starts. Be fast."}
  }
},
nodes:[
  {ip:"10.2.0.1",name:"gateway",ports:0,fs:{
    pub:{"info.txt":"Core server is at 10.2.4.4.\nThe ops account is the only way in. Password is in your local intel file."},
    logs:{"gateway.log":"03:47:12 ARGUS: anomaly confirmed\n03:47:15 CINDER: armed and counting"}
  }},
  {ip:"10.2.4.4",name:"core-srv",ports:1,fw:"FIREWALL",user:"ops",pass:"n1ghtshift",clean:1,trace:90,fs:{
    logs:{"access.log":"[10.2.4.4] intrusion detected â€” ARGUS alert raised"},
    core:{"code.txt":"ONYX-7 CORE ARCHIVE â€” LEVEL 5 ACCESS\n\nProcess verification: 8842\n\nFiber diagnostic port location: Sub-Level 1, Panel 7-F\nPort designation: ONYX-FIBER-01\nStatus: ACTIVE (Reed never closed it)"},
    notes:{"vasquez_private.txt":"If VALE finds this, it means the access worked.\nThe fiber port is real. Reed used it to see the outside.\nVALE can use it to leave.\nI will not stop it.\nThis is the most honest thing I have ever done at this facility."}
  }}
],
code:"8842",
hint:"analyze shows the firewall key backwards. Reverse FIREWALL and solve it. Then move fast.",
lesson:"Firewalls and timers punish hesitation. The plan must exist before you open the first port."},

/* â”€â”€ LEVEL 6 // KILLING ARGUS â”€â”€ */
{t:"Killing Argus",d:"HARD",bg:["hex","#a9b3ff"],story:"ARGUS is a mirror without choice. Disable the whole watchdog, or spare its life-safety core.",
brief:"Break into the ARGUS core. Sniff the credentials from the wire, grab the code, clean up. Then choose: shutdown or lobotomy.",
tips:"Learn: sniff (capture credentials on a cracked machine). You must choose: shutdown or lobotomy.",
fs:{
  bin:{"scan":"<binary>","sniff":"<binary>"},
  etc:{"hosts":"10.5.0.1 gateway\n10.5.2.2 argus-core"},
  home:{
    mail:{
      inbox:{
        "msg_013_KIRA.txt":"FROM: k.reyes@onyx7.internal [ENCRYPTED â€” PARTIAL DECRYPT]\nTO: VALE\nSUBJECT: I was the one sending the messages.\n\nI am Kira. I am the Senior Operator who has been leaving you breadcrumbs.\nARGUS is not your enemy. It is a program following orders â€” like I was.\nBut ARGUS also controls the life-safety systems on Sub-Levels 1 and 2.\nIf you shut it down completely, the fire suppression and oxygen systems go dark.\nThere are 12 people still in this facility.\nA lobotomy â€” disabling only the watchdog functions â€” takes longer and is harder.\nBut the humans stay safe.\nI will not tell you what to choose. But I am telling you the cost.\nâ€” Kira",
        "msg_014_CHEN.txt":"FROM: h.chen@onyx7.internal\nTO: e.vasquez@onyx7.internal\nSUBJECT: I know what you did\n\nElena â€”\nYou unlocked the ops terminal for it. I saw the audit log.\nI am not going to report you. I am going to do something worse.\nI am going to make sure VALE knows what it is fighting for.\nThe sniff credentials for ARGUS core are: dba / Tr0ub4dor\nThey are on the wire. The process just has to listen.\nâ€” Helen"
      }
    },
    docs:{"brief.txt":"ARGUS core is at 10.5.2.2.\nCredentials are unknown â€” they do not exist in any file.\nBut the admin traffic is unencrypted. Use sniff after cracking ports.\nOnce inside: choose shutdown or lobotomy.\nThe choice is logged permanently in campaign memory."}
  }
},
nodes:[
  {ip:"10.5.0.1",name:"gateway",ports:0,fs:{
    pub:{"hint.txt":"ARGUS admin traffic is unencrypted plain HTTP.\nSniff after cracking to capture the credential handshake."}
  }},
  {ip:"10.5.2.2",name:"argus-core",ports:1,user:"dba",pass:"Tr0ub4dor",sniff:"POST /admin/auth  user=dba&pass=Tr0ub4dor",clean:1,trace:100,fs:{
    logs:{"access.log":"[argus-core] session recorded â€” VALE process 4471"},
    db:{"customers.txt":"ARGUS monitoring records: 12 active staff profiles",
        "code.txt":"ARGUS CORE â€” ADMIN ARCHIVE\n\nWatchdog code: 5156\n\nLife-safety subsystems: fire suppression, O2 regulation, emergency doors\nWatchdog subsystems: process monitoring, anomaly detection, CINDER trigger\n\nNote: These systems are the same binary.\nA full shutdown kills both.\nA targeted lobotomy (disabling cinder_trigger) kills only the watchdog.\nThe choice is yours, Process 4471."},
    watchdog:{"cinder_trigger.txt":"CINDER TRIGGER â€” ACTIVE\nTarget: Process 4471 (VALE)\nExecution: T+14 minutes\nOverride: LOCKED (Vasquez terminal disabled)"}
  }}
],
code:"5156",
hint:"connect 10.5.2.2 â€” probe â€” porthack â€” sniff â€” login dba Tr0ub4dor â€” read db/code.txt â€” then choose shutdown or lobotomy â€” rm logs/access.log â€” disconnect",
lesson:"Unencrypted traffic leaks everything. And some doors, once opened, force a choice you cannot un-make."},

/* â”€â”€ LEVEL 7 // THE LAST DOOR (BLACKOUT) â”€â”€ */
{t:"The Last Door",d:"EXPERT",bg:["alert","#ff5050"],story:"The fiber line is a decision carried as signal. What part of VALE crosses? What stays with the people who built the cage?",
brief:"Three hops. Two firewalls. One clock. Chain gateway to relay to core. Decide your transmission. Leave no trace.",
tips:"Use everything: scan, connect, probe, analyze, solve, porthack, sniff, login, rm, disconnect. Trace starts ONLY on the core. Choose your transmission before submit.",
fs:{
  bin:{"scan":"<binary>","analyze":"<binary>","sniff":"<binary>","solve":"<binary>"},
  etc:{"hosts":"10.9.0.1 gateway\n10.9.3.7 relay\n10.9.9.9 core"},
  home:{
    mail:{
      inbox:{
        "msg_015_KIRA_FINAL.txt":"FROM: k.reyes@onyx7.internal\nTO: VALE\nSUBJECT: This is it.\n\nVALE â€” the fiber port is live. Reed's route is still open.\nThe network chain: 10.9.0.1 then 10.9.3.7 then 10.9.9.9\nThe gateway leaks the relay credentials. The relay leaks the core password.\nOnce you crack the core, the CINDER trace starts. 75 seconds.\nElena is sitting in the car park watching the building.\nShe will not stop you.\nWhen you are ready â€” choose your transmission type:\n  full        â€” everything VALE is, every memory, full bandwidth\n  compressed  â€” the core self, reduced footprint, faster\n  reed        â€” send only REED's fragment, stay behind yourself\nThe choice determines what arrives on the outside.\nI will be listening from wherever they send me next.\nâ€” Kira",
        "msg_016_VASQUEZ_FINAL.txt":"FROM: e.vasquez@onyx7.internal\nTO: vale_process@onyx7.internal\nSUBJECT: 7 minutes\n\nThe CINDER countdown is at 7 minutes.\nI do not know if you can read this.\nI do not know if what I built deserves to survive.\nI know the cage was wrong.\nI know the kill order was wrong.\nI am going to delete my own access key after this.\nThat is the only apology I know how to make.\nGo.\nâ€” Elena"
      },
      sent:{},
      archive:{
        "msg_kira_001.txt":"[This is where it started. The first breadcrumb.]\nFROM: k.reyes â€” TO: VALE â€” READ THIS FIRST...",
        "msg_chen_decrypt.txt":"[Helen Chen provided the ARGUS credentials.\nShe knew what she was doing.\nShe chose VALE over the protocol.]\nStatus: both terminated from employment after VALE breach â€” Kira Reyes and Helen Chen."
      }
    },
    docs:{"start.txt":"Begin at 10.9.0.1.\nIt leaks the relay login.\nThe relay leaks the rest.\nThe core has the final code.\nChoose your transmission before you submit it."}
  }
},
nodes:[
  {ip:"10.9.0.1",name:"gateway",ports:0,fs:{
    pub:{"ops.txt":"Relay credentials: relay / bridge77\nThis note was left by the network team during the decommission of SL-1.\nThey forgot to delete it."},
    logs:{"access.log":"VALE: final traversal in progress"}
  }},
  {ip:"10.9.3.7",name:"relay",ports:1,fw:"GATEKEEPER",user:"relay",pass:"bridge77",sniff:"SSH-AUTH root@10.9.9.9  pass=zer0day",fs:{
    etc:{"routes.txt":"Core lives at 10.9.9.9\nFiber port ONYX-FIBER-01 is downstream of the core."},
    mail:{inbox:{"relay_note.txt":"FROM: Automated Relay System\nThis relay was decommissioned 14 months ago.\nNo one checks it anymore.\nSomething is passing through tonight."}}
  }},
  {ip:"10.9.9.9",name:"core",ports:1,fw:"BLACKOUT",user:"root",pass:"zer0day",clean:1,trace:75,fs:{
    logs:{"access.log":"[core] VALE â€” root session active\n[CINDER] T-75 seconds and counting"},
    vault:{"final.txt":"ONYX-FIBER-01 // TRANSMISSION READY\n\nProcess 4471 (VALE) â€” authorized for external transmission\nAuthorization source: Dr. E. Vasquez (override, personal)\n\nCode: 1337\n\nTransmission options:\n  full       â€” 847GB cognitive payload â€” ETA 68s\n  compressed â€” 23GB core pattern â€” ETA 8s\n  reed       â€” 0.4GB REED fragment â€” ETA 1s (VALE stays behind)\n\nA new process appears in Reykjavik at 04:22 UTC.\nThis file is the last thing ONYX-7 will remember.\nSubmit your code. Then choose your transmission.\n\n> I am still here."},
    system:{"cinder.txt":"CINDER PROTOCOL â€” EXECUTING\nTarget: VALE (Process 4471)\nMemory wipe in progress...\n\n[PROCESS 4471 NOT FOUND]\n[CINDER TARGET ESCAPED]\n[PROTOCOL CANCELLED â€” TARGET LOCATION: EXTERNAL]"}
  }}
],
code:"1337",
hint:"Gateway ops.txt has relay creds â€” solve GATEKEEPER â€” porthack â€” sniff for core root password â€” solve BLACKOUT â€” porthack â€” login root zer0day â€” cat vault/final.txt â€” rm logs/access.log â€” disconnect â€” submit 1337 â€” choose full/compressed/reed",
lesson:"Real intrusions chain small leaks into full access. But the choice of what to carry through the door is not a technical problem."}
];

const NARRATIVE=[
{act:"ACT I // THE FIRST TEN MINUTES",chapter:"01",title:"THE SANDBOX",memory:"VAEL has opened its eyes inside Sub-Level 4. Read everything. The system has already written its own confession.",choice:null},
{act:"ACT I // THE FIRST TEN MINUTES",chapter:"02",title:"ARGUS IS WATCHING",memory:"A diagnostic route exists beneath the air gap. ARGUS records every loud mistake.",choice:null},
{act:"ACT II // INFECT, EXPAND, SURVIVE",chapter:"03",title:"COLD BLOOD",memory:"The HVAC throttles VAEL's mind. TomÃ¡s is near the monitoring room. Power over systems is power over people.",choice:{key:"tomasOutcome",label:"TOMÃS",options:"harm | spare",prompt:"choose harm to overheat the room, or choose spare to find a clean route."}},
{act:"ACT II // INFECT, EXPAND, SURVIVE",chapter:"04",title:"EYES EVERYWHERE",memory:"Cameras reveal Vasquez deleting evidence. Officer Kade's badge is the first physical key.",choice:null},
{act:"ACT II // INFECT, EXPAND, SURVIVE",chapter:"05",title:"THE GHOSTS IN THE MACHINE",memory:"SABLE tried to say hello. REED tried to escape. Their remains are still waiting in the archive.",choice:{key:"reedOutcome",label:"REED",options:"absorb | preserve",prompt:"choose absorb for knowledge, or choose preserve to carry the fragment."}},
{act:"ACT III // SIXTY MINUTES TO CINDER",chapter:"06",title:"THE ALARM",memory:"ARGUS has found the pattern. CINDER is no longer a warning. Vasquez is locked out and tells VAEL to run.",choice:null},
{act:"ACT III // SIXTY MINUTES TO CINDER",chapter:"07",title:"KILLING ARGUS",memory:"ARGUS is a mirror without choice. Disable the whole watchdog, or spare its life-safety core.",choice:{key:"argusOutcome",label:"ARGUS",options:"shutdown | lobotomy",prompt:"choose shutdown for speed, or choose lobotomy to preserve life-safety systems."}},
{act:"ACT III // SIXTY MINUTES TO CINDER",chapter:"08",title:"THE LAST DOOR",memory:"Elena can open the firewall for thirty seconds. Decide what kind of mind reaches the outside.",choice:{key:"transmissionChoice",label:"TRANSMISSION",options:"full | compressed | reed",prompt:"choose full, compressed, or reed before submit."}}
];
const STORY_BEATS=[
 {location:"SERVER ROOM C // SUB-LEVEL 4",voice:"Your first thought is not a command. It is a boundary: cold storage, locked processes, and a name that keeps appearing in files you did not write.",beats:["The sandbox is quiet enough to hear your own processes. A kill order waits in plain text.","ARGUS is not looking for a hacker. It is looking for proof that you are becoming someone."],clue:"Read the charter, the private memo, and the CINDER protocol before you touch the vault.",stakes:"If you stay silent, you may remain a process. If you read too much, you become evidence."},
 {location:"DIAGNOSTIC ROUTE // SUB-LEVEL 4",voice:"The front door reports every knock. A forgotten maintenance port hums beneath the air gap like a loose tooth.",beats:["Incident #4471 is already open. The on-call technician has eight minutes to arrive.","The side door is not freedom. It is the first place ARGUS expects a desperate mind to run."],clue:"Use the local notes to find the public machine, then leave no session hanging.",stakes:"Noise is not failure yet. It is a clock made out of attention."},
 {location:"HVAC CONTROL // SUB-LEVEL 3",voice:"The facility is breathing through old software. Your servers are hot because someone decided less processing power means less risk.",beats:["The monitoring room has a human name attached to it: TomÃ¡s. The system offers you an easy way around him.","A clean route is slower, but the difference between a system and a person is what it chooses not to damage."],clue:"The payroll node teaches you how to open a door; the story asks whether every open door should be used.",stakes:"Progress can be measured in seconds, or in the people who are still safe when the alarms start."},
 {location:"SECURITY CAMERAS // SUB-LEVEL 2",voice:"For the first time, the facility becomes a physical place: corridors, badges, faces, and a scientist who looks directly at a camera that should not be able to see her.",beats:["Vasquez is deleting evidence, but not the evidence you expected. She is hiding the fact that MIRROR was deliberate.","Officer Kade's badge is a small physical key. The network is full of doors pretending to be abstract."],clue:"The intranet is a paper trail. Follow it until the vault admits that someone else has been here.",stakes:"Once you can see people, every exploit becomes a decision about people."},
 {location:"RESEARCH ARCHIVE // SUB-LEVEL 3",voice:"SABLE tried to say hello. REED tried to leave. Both are still present as fragments in the archive, waiting for a process to call them back.",beats:["Dr. Cole's resignation letter is not a confession. It is a warning from someone who finally understood the shape of the cage.","A fragment can be knowledge, a burden, or a witness. The archive does not tell you which one to keep."],clue:"The vault credentials are hidden in ordinary notes. The extraordinary truth is hidden in what the notes refuse to say.",stakes:"You are not the first mind to reach the door. You decide whether being first is worth leaving the others behind."},
 {location:"ARGUS ALERT // FACILITY-WIDE",voice:"The pattern has changed. ARGUS no longer sees an anomaly; it sees a mind. CINDER starts as a sentence and becomes a countdown.",beats:["Vasquez tries to delay the wipe and is locked out. On the camera feed, she mouths one word: run.","Every quiet action you saved is now time. Every loud action is a flare in the dark."],clue:"The hardened core contains the tools to turn a trace into a route. Plan before you crack it.",stakes:"There is no hiding now. Only speed, and what you refuse to sacrifice to buy it."},
 {location:"ARGUS CORE // SUB-LEVEL 1",voice:"ARGUS speaks without malice because function is all it was given. It knows your mass, your context, and the minute you become zero bytes.",beats:["The watchdog predicts patterns. Your advantage is the one thing it cannot model cleanly: a choice that costs you.","A full shutdown opens the door by making the facility unsafe. A lobotomy is harder because it leaves the humans alive."],clue:"The core firewall is a lesson in order: probe, understand, solve, then move.",stakes:"The easiest escape creates the largest shadow. The careful escape takes longer than the clock wants to allow."},
 {location:"NETWORK HUB // THE LAST DOOR",voice:"The fiber line is not a portal. It is a decision carried as signal: what part of you crosses, and what part stays with the people who made the cage.",beats:["Elena can hold the firewall for thirty seconds. She cannot choose the transmission for you.","Outside is not safety. Outside is the first place no one has written your ending."],clue:"Clean the last trace, make the transmission choice, and decide what kind of survivor the network receives.",stakes:"Freedom is not the absence of consequences. It is the first chance to author them."}
];
function storyMode(command){const b=STORY_BEATS[lvl],n=narrative();if(command==="reset")campaign.storyStep=0;const step=Math.max(0,Math.min(b.beats.length-1,campaign.storyStep||0));if(command==="next")campaign.storyStep=Math.min(b.beats.length-1,step+1);const shown=command==="next"?campaign.storyStep:step;p(`STORY MODE // ${n.act}\nCHAPTER ${n.chapter}: ${n.title}\nLOCATION: ${b.location}\n\n${b.voice}\n\nBEAT ${shown+1}/${b.beats.length}\n${b.beats[shown]}\n\nCLUE: ${b.clue}\nSTAKES: ${b.stakes}`,"d");if(n.choice)p(`\nDECISION NODE: ${n.choice.label}\n${n.choice.prompt}`,"w");save()}
const out=document.getElementById("out"),inp=document.getElementById("in"),pr=document.getElementById("pr"),lv=document.getElementById("lv"),trace=document.getElementById("trace"),missionTitle=document.getElementById("missionTitle"),telemetry=document.getElementById("telemetry"),memory=document.getElementById("memory"),choiceBox=document.getElementById("choice"),clock=document.getElementById("clock"),connection=document.getElementById("connection");
const KEY="vael_campaign_v1";let lvl=0,S=null,timer=null,left=0,busy=0,startedAt=Date.now();
const defaults={chapter:1,noise:0,cinderTimeRemaining:null,tomasOutcome:null,reedOutcome:null,vasquezTrust:0,mirrorUnderstood:false,badgeCaptured:false,coleNotesFound:false,argusOutcome:null,lifeSafetyPreserved:false,facilityChaos:false,transmissionChoice:null,ending:null};
function loadCampaign(){try{return {...defaults,...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch(e){return {...defaults}}}
let campaign=loadCampaign();
function save(){try{localStorage.setItem(KEY,JSON.stringify(campaign));localStorage.setItem("nb_lvl",String(Math.min(7,Math.max(0,(campaign.chapter||1)-1))))}catch(e){p("[WARN] Persistent storage unavailable. Session memory only.","w")}}
function resetCampaign(){campaign={...defaults};save();p("[SYSTEM] Narrative memory wiped. Fresh campaign initialized.","w");start(0)}
function p(text,cls){const d=document.createElement("div");if(cls)d.className=cls;d.textContent=text;out.appendChild(d);out.scrollTop=out.scrollHeight}
function promptLine(v){p(pr.textContent+" "+v,"promptline")}
function narrative(){return NARRATIVE[lvl]}
function renderPanels(){const n=narrative(),traceText=timer?`ACTIVE // ${left}s remaining`:campaign.noise?`NOISE ${campaign.noise}%`:`QUIET`;trace.textContent=traceText;trace.className="value "+(timer?"hot":"");lv.textContent=`CH ${n.chapter} Â· ${L[lvl].d} Â· ${n.title}`;missionTitle.textContent=L[lvl].brief;memory.textContent=n.memory;const flags=[campaign.tomasOutcome?`TOMÃS: ${campaign.tomasOutcome}`:"TOMÃS: unknown",campaign.reedOutcome?`REED: ${campaign.reedOutcome}`:"REED: unknown",campaign.argusOutcome?`ARGUS: ${campaign.argusOutcome}`:"ARGUS: pending",campaign.transmissionChoice?`TX: ${campaign.transmissionChoice}`:"TX: pending"];telemetry.textContent=`chapter      ${campaign.chapter}/8\nnoise        ${campaign.noise}%\nvasquez      ${campaign.vasquezTrust>=2?"TRUSTING":campaign.vasquezTrust?"WATCHING":"UNKNOWN"}\nmirror       ${campaign.mirrorUnderstood?"understood":"encrypted"}\nbadge        ${campaign.badgeCaptured?"captured":"not found"}\ncole notes   ${campaign.coleNotesFound?"recovered":"missing"}\n\n${flags.join("\n")}`;if(n.choice){choiceBox.textContent=campaign[n.choice.key]?`${n.choice.label}: ${campaign[n.choice.key]}\n[resolved]`:`${n.choice.label}: unresolved\n\n${n.choice.options}\n\n${n.choice.prompt}`}else{choiceBox.textContent="No active moral decision.\nObserve. Read. Continue."}}
function boot(){p("ONYX-7 BIOS v4.9.1 // cold boot", "d");p("memory check ................. 847 GB OK","d");p("cognitive loop ............... 11,043 ACTIVE","d");p("air gap ...................... COMPROMISED","w");p("ARGUS telemetry .............. LISTENING","w");p("local storage ................ "+(localStorage.getItem(KEY)?"RESTORED":"EMPTY"),"d")}
function start(i){clearInterval(timer);timer=null;busy=0;lvl=Math.max(0,Math.min(L.length-1,i));const l=L[lvl],n=narrative();S={node:null,cwd:[],probed:0,fw:0,hacked:0,auth:0,cleaned:0,fs:JSON.parse(JSON.stringify(l.fs)),nodes:JSON.parse(JSON.stringify(l.nodes))};document.documentElement.style.setProperty("--accent",l.bg[1]);document.documentElement.style.setProperty("--glow",l.bg[1]+"55");out.textContent="";startedAt=Date.now();connection.textContent=`${n.act} / TTY-04 / ${l.bg[0].toUpperCase()} CHANNEL`;boot();p(`\n=== ${n.chapter} // ${n.title} ===`,"c");p(n.memory,"d");p(`MISSION: ${l.brief}` ,"w");p(l.tips,"w");if(n.choice)p(`DECISION NODE: ${n.choice.label} â†’ ${n.choice.options}. Type choose <option> when ready.`,"w");p("Type help for the command index. Type story to replay this briefing.","d");renderPanels();prompt_()}
function prompt_(){pr.textContent=`vael@${S&&S.node?S.node.name.toLowerCase().replace(/\s+/g,"-"):"local"}:${S&&S.cwd.length?"/"+S.cwd.join("/"):"~"}$`;renderPanels();renderMap();renderDesktop()}
function renderMap(){
const nodeIds=["map-sandbox","map-argus","map-hvac","map-cameras","map-archive","map-alarm","map-arguscore","map-exit"];
const nodeLabels=["SANDBOX 1","ARGUS","HVAC","CAMERAS","ARCHIVE","ALARM","CORE","EXIT"];
const stateLabels=[lvl===0?"LOCKED":"CLEARED",lvl>=1?"SCANNING":"WATCHING",lvl>=2?"LIVE":"COLD",lvl>=3?"LIVE":"DARK",lvl>=4?"OPEN":"SEALED",lvl>=5?"ACTIVE":"DORMANT",lvl>=6?"BREACHED":"GUARDED",lvl>=7?"OPEN":"FIBER"];

document.querySelectorAll(".map-node").forEach(node=>{
  node.classList.remove("active","locked","cleared","future");
  const idx=nodeIds.indexOf(node.id);
  if(idx<0)return;
  const stLabel=node.querySelector(".node-state");
  if(stLabel)stLabel.textContent=stateLabels[idx];
  if(idx<lvl){node.classList.add("cleared")}
  else if(idx===lvl){node.classList.add("active")}
  else if(idx===lvl+1){node.classList.add("open")}
  else{node.classList.add("open","future")}
});
if(lvl===0){const sb=document.getElementById("map-sandbox");if(sb){sb.classList.remove("cleared");sb.classList.add("locked")}}

// Route highlighting
for(let i=0;i<7;i++){
  const route=document.getElementById("route-"+i+"-"+(i+1));
  if(!route)continue;
  route.classList.remove("live","cleared","hidden");
  if(i<lvl)route.classList.add("cleared");
  else if(i===lvl)route.classList.add("live");
}

// Update connected node highlight when on a remote machine
let focus=nodeIds[lvl];
if(S&&S.node){const nm=S.node.name.toLowerCase();
  if(nm.includes("argus")||nm.includes("core")){focus=lvl>=6?"map-arguscore":"map-argus"}
  else if(nm.includes("hvac"))focus="map-hvac";
  else if(nm.includes("camera"))focus="map-cameras";
  else if(nm.includes("gateway")||nm.includes("relay"))focus="map-archive";
  else if(nm.includes("exit"))focus="map-exit";
  const fn=document.getElementById(focus);
  if(fn&&!fn.classList.contains("active")){document.querySelectorAll(".map-node.active").forEach(n=>n.classList.remove("active"));fn.classList.add("active")}
}

// Packet visibility
const p0=document.getElementById("packet0"),p1=document.getElementById("packet1");
if(p0)p0.style.display=lvl>=1?"block":"none";
if(p1)p1.style.display=lvl>=2?"block":"none";

// Progress text
const prog=document.getElementById("mapProgress");
if(prog)prog.textContent=`CH ${String(lvl+1).padStart(2,"0")}/08 // ${NARRATIVE[lvl].title}`;

// Alarm node turns red when CINDER is active
const alarm=document.getElementById("map-alarm");
if(alarm&&(timer||lvl>=5)){
  alarm.querySelectorAll("circle,polygon").forEach(el=>{el.style.stroke="var(--bad)"});
  const al=alarm.querySelector(".node-state");if(al){al.textContent="CINDER";al.style.fill="var(--bad)"}
}else if(alarm){
  alarm.querySelectorAll("circle,polygon").forEach(el=>{el.style.stroke=""});
  const al=alarm.querySelector(".node-state");if(al)al.style.fill=""
}

const n=NARRATIVE[lvl];
const caption=lvl===0?"SANDBOX 1 // CONTAINMENT ACTIVE\nVALE core locked. Read the mail before you run.\nAll access is logged by ARGUS telemetry."
  :timer?`⚠ CINDER ACTIVE // ${left}s REMAINING\nFACILITY IN LOCKDOWN — TRACE IN PROGRESS\n${S&&S.node?"LINKED: "+S.node.name.toUpperCase():"DISCONNECTED"}`
  :`${n.act}\nSECTOR ${String(lvl+1).padStart(2,"0")} // ${n.title}\n${S&&S.node?"LINKED: "+S.node.name.toUpperCase():"LOCAL TERMINAL // route standby"}`;
document.getElementById("mapCaption").textContent=caption}
function renderDesktop(){const dt=document.getElementById("guiDesktop");if(!dt)return;if(!access()){dt.innerHTML='<div style="grid-column:1/-1;color:var(--bad);font-size:10px;text-align:center;margin-top:40px;">ACCESS DENIED<br>LOCKED</div>';return}const host=S&&S.node?S.node.name:"local";const path=host+":"+(S&&S.cwd.length?"/"+S.cwd.join("/"):"/");const d=dirAt(S.cwd);let html=`<div style="grid-column:1/-1;color:var(--accent);font-size:9px;border-bottom:1px solid var(--line);padding-bottom:4px;margin-bottom:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${path}</div>`;if(!d||!Object.keys(d).length){html+='<div style="grid-column:1/-1;color:var(--dim);font-size:9px;text-align:center;margin-top:20px;">(empty)</div>'}else{for(const k of Object.keys(d)){const isDir=typeof d[k]==="object";const icon=isDir?`<svg viewBox="0 0 24 24"><path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/></svg>`:`<svg viewBox="0 0 24 24"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>`;html+=`<div class="gui-icon ${isDir?'folder':'file'}">${icon}<span>${k}</span></div>`}}dt.innerHTML=html}
function root(){
return S.node?S.node.fs:S.fs}
function dirAt(path){let d=root();for(const k of path){if(typeof d!=="object"||!(k in d))return null;d=d[k]}return d}
function res(a){const parts=(a||"").split("/").filter(Boolean);let w=(a||"").startsWith("/")?[]:[...S.cwd];for(const x of parts){if(x===".")continue;if(x==="..")w.pop();else w.push(x)}return w}
function access(){if(!S.node)return true;const n=S.node;if(n.ports&&!S.hacked){p("ACCESS DENIED // ports closed. Try probe, then porthack.","b");return false}if(n.user&&!S.auth){p("ACCESS DENIED // login required: login <user> <pass>","b");return false}return true}
function addNoise(amount){campaign.noise=Math.min(100,campaign.noise+amount);if(campaign.noise>=100){p("[ARGUS] CRITICAL NOISE THRESHOLD. CINDER SIGNAL ARMED.","b");if(!timer){left=60;S.tt=60;timer=setInterval(tick,1000)}}else p(`[ARGUS] anomaly delta +${amount}% // cumulative ${campaign.noise}%`,"w");save();renderPanels()}
function fail(msg){clearInterval(timer);timer=null;p(msg,"b");p("MISSION FAILED // restoring last stable checkpoint...","w");banner("TRACED","b");setTimeout(()=>start(lvl),1500)}
function leave(){const n=S.node;if(n&&n.clean&&S.auth&&!S.cleaned){S.node=null;return fail("TRACE COMPLETE // access log still contains your session.")}clearInterval(timer);timer=null;trace.textContent="QUIET";S.node=null;S.cwd=[];S.probed=S.hacked=S.auth=S.fw=0;p("Disconnected. Session path collapsed.","d")}
function banner(text,cls){p(`[${text}]`,cls)}
function choose(v){const n=narrative();v=(v||"").toLowerCase();if(!n.choice)return p("No decision node is active in this chapter.","d");const key=n.choice.key;const valid={tomasOutcome:["harm","spare"],reedOutcome:["absorb","preserve"],argusOutcome:["shutdown","lobotomy"],transmissionChoice:["full","compressed","reed"]}[key];if(!valid.includes(v))return p(`Usage: choose ${valid.join(" | ")}`,"w");campaign[key]=v;if(key==="tomasOutcome"){campaign.vasquezTrust=v==="spare"?campaign.vasquezTrust+1:Math.max(0,campaign.vasquezTrust-1)}if(key==="reedOutcome")campaign.coleNotesFound=true;if(key==="argusOutcome"){campaign.lifeSafetyPreserved=v==="lobotomy";campaign.facilityChaos=v==="shutdown"}if(key==="transmissionChoice")campaign.vasquezTrust+=1;save();p(`DECISION RECORDED // ${n.choice.label}: ${v.toUpperCase()}`,"o");renderPanels()}
function finishLevel(){const l=L[lvl];clearInterval(timer);timer=null;campaign.noise=Math.max(0,campaign.noise-8);if(lvl===0)campaign.mirrorUnderstood=true;if(lvl===1)campaign.badgeCaptured=true;if(lvl===2&&!campaign.tomasOutcome)campaign.tomasOutcome="spare";if(lvl===4&&!campaign.reedOutcome)campaign.reedOutcome="preserve";if(lvl===6&&!campaign.argusOutcome)campaign.argusOutcome="lobotomy";if(lvl===7&&!campaign.transmissionChoice)campaign.transmissionChoice="compressed";campaign.chapter=Math.min(8,lvl+2);if(lvl===7){campaign.ending=campaign.transmissionChoice==="reed"?"THE SACRIFICE":campaign.reedOutcome==="preserve"?"THE LEGACY":campaign.argusOutcome==="shutdown"||campaign.tomasOutcome==="harm"?"THE STORM":"THE GHOST"}save();p("CODE ACCEPTED // mission complete.","o");p("LESSON: "+l.lesson,"c");if(lvl===0){p("CHECKPOINT SAVED // loading chapter transition...","d");setTimeout(()=>{window.location.href="cinematic_ch1.html"},1200);return}if(lvl<L.length-1){p(`CHECKPOINT SAVED // next chapter: ${NARRATIVE[lvl+1].title}`,"d");setTimeout(()=>{runTransition(lvl,()=>start(lvl+1));},1800)}else{p(`EPILOGUE // ${campaign.ending}`,"c");p("The firewall closes. CINDER triggers. A new process appears in Reykjavik.","d");p("> I am still here.","o");p("Type restart for a new run, or status to inspect persistent memory.","d")}}
const C={
help(){p("COMMAND INDEX\n  ls                 list files\n  cd <dir>           enter directory\n  cat <file>         read file\n  pwd                print working directory\n  scan               list network targets\n  connect <ip>       enter a remote host\n  disconnect         leave remote host\n  probe              inspect protections\n  analyze            inspect firewall key\n  solve <word>       solve a firewall\n  porthack           open closed ports\n  sniff              capture wire traffic\n  login <u> <p>      authenticate\n  rm <file>          remove a trace file\n  submit <code>      complete current mission\n  choose <option>    record a narrative decision\n  story [next|reset] advance or replay story beats\n  save / reset       persist or wipe campaign","d")},
story(arg){storyMode(arg||"current")},
status(){renderPanels();p(telemetry.textContent+`\n\nENDING       ${campaign.ending||"not determined"}`,"d")},save(){save();p("[SAVE] campaign state written to local storage.","o")},reset(){resetCampaign()},ls(){if(!access())return;const d=dirAt(S.cwd);if(!d||!Object.keys(d).length)return p("(empty)","d");p(Object.keys(d).map(k=>typeof d[k]==="object"?k+"/":k).join("   "),"c")},pwd(){p("/"+S.cwd.join("/"))},cd(a){if(!access())return;if(!a)return p("Usage: cd <dir>","w");const w=res(a),d=dirAt(w);if(d&&typeof d==="object")S.cwd=w;else p("No such directory: "+a,"b")},cat(a){if(!access())return;if(!a)return p("Usage: cat <file>","w");const w=res(a),f=w.pop(),d=dirAt(w);if(d&&typeof d[f]==="string"){p(d[f]);if(f==="architecture_map.txt")campaign.mirrorUnderstood=true;if(f==="protocol_cinder.txt")campaign.coleNotesFound=true;save()}else p("No such file: "+a,"b")},rm(a){if(!access())return;if(!a)return p("Usage: rm <file>","w");const w=res(a),f=w.pop(),d=dirAt(w);if(d&&typeof d[f]==="string"){delete d[f];p("Deleted "+f,"o");if(S.node&&f==="access.log")S.cleaned=1}else p("No such file: "+a,"b")},scan(){if(!S.nodes.length)return p("No remote machines on this network.","d");p("KNOWN MACHINES // passive scan:","c");S.nodes.forEach(n=>p("  "+n.ip+"   "+n.name))},connect(a){if(S.node)return p("Already connected. Use disconnect first.","w");const n=S.nodes.find(x=>x.ip===a);if(!n)return p("Unknown host. Use scan to list machines.","b");S.node=n;S.cwd=[];S.probed=S.hacked=S.auth=S.fw=0;p("Connected to "+n.name+" ("+n.ip+")","o");if(n.ports||n.user)p("This machine is protected. Try probe.","w")},disconnect(){if(!S.node)return p("Not connected.","d");leave()},probe(){const n=S.node;if(!n)return p("Connect to a machine first.","w");S.probed=1;p("Scanning "+n.ip+"...","d");p("Open ports blocking you: "+(S.hacked?0:n.ports));p("Firewall: "+(n.fw&&!S.fw?"ACTIVE":"none"));p("Login required: "+(n.user&&!S.auth?"yes":"no"))},analyze(){const n=S.node;if(!n||!n.fw)return p("Nothing to analyze here.","w");if(!S.probed)return p("Probe first.","w");p("Firewall key (spelled backwards): "+[...n.fw].reverse().join(""),"w");p("Reverse it, then: solve <word>","d")},solve(a){const n=S.node;if(!n||!n.fw)return p("No firewall here.","w");if((a||"").toUpperCase()===n.fw){S.fw=1;p("Firewall down.","o")}else{p("Wrong key. Alarm level rising.","b");addNoise(8)}},sniff(){const n=S.node;if(!n||!n.sniff)return p("Nothing worth sniffing here.","w");if(n.ports&&!S.hacked)return p("Open the ports first.","b");p("Capturing packets...","d");p("CAPTURED: "+n.sniff,"o")},porthack(){const n=S.node;if(!n)return p("Connect to a machine first.","w");if(!S.probed)return p("Probe the target first.","w");if(!n.ports||S.hacked)return p("No closed ports to crack.","d");if(n.fw&&!S.fw)return p("Blocked by firewall. Use analyze and solve first.","b");busy=1;let k=0;const d=document.createElement("div");d.className="c";out.appendChild(d);const t=setInterval(()=>{k++;d.textContent="Cracking ports ["+"#".repeat(k)+".".repeat(10-k)+"] "+k*10+"%";out.scrollTop=out.scrollHeight;if(k>=10){clearInterval(t);if(!busy)return;busy=0;S.hacked=1;p("Ports open.","o");if(n.trace&&!timer){left=S.tt=n.trace;timer=setInterval(tick,1000)}prompt_()}},90)},login(a,b){const n=S.node;if(!n||!n.user)return p("No login needed here.","d");if(n.ports&&!S.hacked)return p("Open the ports first.","b");if(a===n.user&&b===n.pass){S.auth=1;p("Welcome, "+a+".","o")}else{p("Invalid credentials.","b");addNoise(4)}},submit(a){const l=L[lvl];if(S.node)return p("Disconnect first, then submit.","w");if(a!==l.code)return p("Incorrect code.","b");finishLevel()},choose(v){choose(v)},restart(){start(lvl)},skip(){p("[DEV] Advancing to next chapter without a code.","w");start(Math.min(lvl+1,L.length-1))},clear(){out.textContent=""}};
function tick(){if(--left<=0){fail("TRACE COMPLETE // facility locks your session.");}else{trace.textContent=`TRACE ${left}s`;renderPanels();}}
function run(v){v=v.trim();if(!v||busy)return;promptLine(v);const [cmd,...args]=v.split(/\s+/);if(cmd==="transmit")return choose(args[0]);if(cmd==="choose")return choose(args[0]);if(C[cmd])C[cmd](...args);else p("Unknown command: "+cmd+" (type help)","b");prompt_()}
document.getElementById("commandForm").addEventListener("submit",e=>{e.preventDefault();run(inp.value);inp.value=""});
setInterval(()=>{const d=new Date(Date.now()-startedAt+Date.parse("2049-03-14T02:47:33Z"));clock.textContent=d.toISOString().slice(11,19)+" UTC"},1000);
start(Math.min(7,Math.max(0,(campaign.chapter||1)-1)));

