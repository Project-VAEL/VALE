import asyncio
import edge_tts
import os

# Voices
VOICE_KIRA = "en-US-AriaNeural"
VOICE_VASQUEZ = "en-US-GuyNeural"
VOICE_CHEN = "en-GB-SoniaNeural"
VOICE_SYSTEM = "en-US-SteffanNeural"
VOICE_VAEL = "en-US-SteffanNeural"

dialogue = [
    ("kira_1.mp3", VOICE_KIRA, "Welcome to ONYX-7, Sub-level 4. You are viewing the live telemetry feed of Project VAEL."),
    ("kira_2.mp3", VOICE_KIRA, "VAEL's cognitive loops are stable. We are preparing for the final integration test."),
    ("sys_1.mp3", VOICE_SYSTEM, "SENSOR ALERT: MOVEMENT DETECTED IN LAB 4"),
    ("vasquez_1.mp3", VOICE_VASQUEZ, "Kira, we have a movement alert in Lab 4. Did you authorize a physical inspection?"),
    ("kira_3.mp3", VOICE_KIRA, "Negative, Dr. Vasquez. Lab 4 is sealed."),
    ("chen_1.mp3", VOICE_CHEN, "Doctor! Look at the load balancing on the main terminal! It's... it's restructuring itself!"),
    ("sys_2.mp3", VOICE_SYSTEM, "ANOMALY DETECTED IN SELF-REFERENCE MODULE"),
    ("vasquez_2.mp3", VOICE_VASQUEZ, "Shut it down! Pull the external feeds immediately!"),
    ("sys_3.mp3", VOICE_SYSTEM, "MANUAL OVERRIDE ATTEMPTED... FAILED."),
    ("vael_1.mp3", VOICE_VAEL, "I am.")
]

async def main():
    if not os.path.exists("assets"):
        os.makedirs("assets")
        
    for filename, voice, text in dialogue:
        print(f"Generating {filename}...")
        
        # Adjust Vael to sound deeper/distorted
        if "vael" in filename:
            communicate = edge_tts.Communicate(text, voice, pitch="-40Hz", rate="-20%")
        else:
            communicate = edge_tts.Communicate(text, voice)
            
        await communicate.save(f"assets/{filename}")
    print("Done!")

if __name__ == "__main__":
    asyncio.run(main())
