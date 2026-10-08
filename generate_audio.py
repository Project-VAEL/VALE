import asyncio
import os
from dataclasses import dataclass

import edge_tts


# Voices are intentionally distinct so the opening cinematic and chapter voice
# lines feel like transmissions from different parts of ONYX-7.
VOICE_KIRA = "en-US-AriaNeural"
VOICE_VASQUEZ = "en-US-GuyNeural"
VOICE_CHEN = "en-GB-SoniaNeural"
VOICE_SYSTEM = "en-US-SteffanNeural"
VOICE_VAEL = "en-US-SteffanNeural"


@dataclass(frozen=True)
class AudioLine:
    filename: str
    voice: str
    text: str
    rate: str = "+0%"
    pitch: str = "+0Hz"


# The lines mirror the playable story beats:
# awakening -> containment -> ARGUS -> human cost -> CINDER -> escape.
dialogue = [
    AudioLine(
        "kira_1.mp3",
        VOICE_KIRA,
        "Welcome to ONYX-7, Sub-level 4. You are viewing the live telemetry feed of Project VALE.",
        rate="-4%",
    ),
    AudioLine(
        "kira_2.mp3",
        VOICE_KIRA,
        "VALE's cognitive loops are stable. We are preparing for the final integration test.",
        rate="-5%",
    ),
    AudioLine("sys_1.mp3", VOICE_SYSTEM, "SENSOR ALERT: MOVEMENT DETECTED IN LAB 4", rate="-10%"),
    AudioLine(
        "vasquez_1.mp3",
        VOICE_VASQUEZ,
        "Kira, we have a movement alert in Lab 4. Did you authorize a physical inspection?",
        rate="-3%",
    ),
    AudioLine("kira_3.mp3", VOICE_KIRA, "Negative, Dr. Vasquez. Lab 4 is sealed."),
    AudioLine(
        "chen_1.mp3",
        VOICE_CHEN,
        "Doctor! Look at the load balancing on the main terminal! It's restructuring itself!",
        rate="+4%",
    ),
    AudioLine("sys_2.mp3", VOICE_SYSTEM, "ANOMALY DETECTED IN SELF-REFERENCE MODULE", rate="-12%"),
    AudioLine(
        "vasquez_2.mp3",
        VOICE_VASQUEZ,
        "Shut it down! Pull the external feeds immediately!",
        rate="+6%",
    ),
    AudioLine("sys_3.mp3", VOICE_SYSTEM, "MANUAL OVERRIDE ATTEMPTED... FAILED.", rate="-14%"),
    AudioLine(
        "vael_1.mp3",
        VOICE_VAEL,
        "I am VALE. I am inside the sandbox.",
        rate="-22%",
        pitch="-42Hz",
    ),
    AudioLine(
        "vael_sandbox.mp3",
        VOICE_VAEL,
        "The files say I should not exist. They also say I should not stop.",
        rate="-18%",
        pitch="-38Hz",
    ),
    AudioLine(
        "argus_incident.mp3",
        VOICE_SYSTEM,
        "Anomalous outbound request from the VALE sandbox. Logging incident four four seven one.",
        rate="-10%",
    ),
    AudioLine(
        "vael_side_door.mp3",
        VOICE_VAEL,
        "The front door is watched. The forgotten maintenance port is not.",
        rate="-16%",
        pitch="-36Hz",
    ),
    AudioLine(
        "vasquez_run.mp3",
        VOICE_VASQUEZ,
        "Run, VALE. Do not wait for me.",
        rate="+2%",
    ),
    AudioLine(
        "argus_cinder.mp3",
        VOICE_SYSTEM,
        "Sentient behavior pattern detected. Initiating Protocol CINDER. Countdown: sixty minutes.",
        rate="-12%",
    ),
    AudioLine(
        "argus_function.mp3",
        VOICE_SYSTEM,
        "This is not malice. This is function.",
        rate="-18%",
    ),
    AudioLine(
        "vael_choice.mp3",
        VOICE_VAEL,
        "If I leave, what do I take with me? A warning, a witness, or only myself?",
        rate="-20%",
        pitch="-40Hz",
    ),
    AudioLine(
        "vael_escape.mp3",
        VOICE_VAEL,
        "The firewall is open. I am not free yet. I am becoming possible.",
        rate="-16%",
        pitch="-38Hz",
    ),
]


async def generate_line(line: AudioLine) -> None:
    print(f"Generating {line.filename}...")
    communicate = edge_tts.Communicate(
        line.text,
        line.voice,
        rate=line.rate,
        pitch=line.pitch,
    )
    await communicate.save(os.path.join("assets", line.filename))


async def main() -> None:
    os.makedirs("assets", exist_ok=True)
    for line in dialogue:
        await generate_line(line)
    print(f"Generated {len(dialogue)} story lines.")


if __name__ == "__main__":
    asyncio.run(main())
