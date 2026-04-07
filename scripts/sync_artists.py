import json
import os

MASTER_FILE = "src/data/songs.json"

ARTISTS = [
    "A.R. Rahman", "Adnan Sami", "Akhil Sachdeva", "Alisha Chinai", "Amaal Malik", "Ankit Tiwari", "Anuradha Paudwal",
    "Arijit Singh", "Armaan Malik", "Asha Bhosle", "Ayushmann Khurrana", "Bhupinder Singh", "Coke Studio", "Dhvani Bhanushali",
    "Farhan Akhtar", "Gajendra Verma", "Gulzar", "Hemant Kumar", "Ilaiyaraaja", "Jagjit Singh", "Jeet Gannguli", "Junoon",
    "Kailash Kher", "Kavita Krishnamurthy", "Kumar Sanu", "Lata Mangeshkar", "Madan Mohan", "Manna Dey", "Mika Singh",
    "Mohammad Irfan", "Mohit Chauhan", "Mukesh", "Nadeem Shravan", "Nusrat Fateh Ali Khan", "Palak Muchhal", "Papon",
    "Prateek Kuhad", "R.D. Burman", "Rahat Fateh Ali Khan", "Roop Kumar Rathore", "S.P. Balasubrahmanyam", "Salil Chowdhury",
    "Shaan", "Shankar Mahadevan", "Shibani Kashyap", "Soham Naik", "Sonu Nigam", "Sukhwinder Singh", "Suresh Wadkar",
    "Vinod Rathod", "Vishal Mishra", "Yesudas", "Abhijeet", "Ajay Atul", "Ali Azmat", "Alka Yagnik", "Amit Trivedi",
    "Anu Malik", "Anuv Jain", "Arko", "Aryans", "Atif Aslam", "Bappi Lahiri", "Chithra", "Darshan Raval", "Falak",
    "Fuzon", "Ghulam Ali", "Hariharan", "Himesh Reshammiya", "Indian Ocean", "Javed Ali", "Jubin Nautiyal", "K.K.",
    "Kamran Ahmed", "Kishore Kumar", "Kunal Ganjawala", "Lucky Ali", "Mahendra Kapoor", "Mehdi Hasan", "Mithoon",
    "Mohammed Rafi", "Monali Thakur", "Mustaf Zahid", "Neha Kakkar", "O.P. Nayyar", "Palash Sen", "Praak", "Pritam",
    "Rabbi Shergill", "Ram Sampath", "S.D. Burman", "Sadhana Sargam", "Salim Merchant", "Shafqat Amanat Ali", "Sharib Toshi",
    "Shreya Ghoshal", "Sona Mohapatra", "Strings", "Sunidhi Chauhan", "Udit Narayan", "Vishal Bhardwaj", "Vishal Shekhar", "Zubin Garg"
]

def normalize_artist(name):
    if not name: return name
    # Try to match the provided list (case-insensitive and hyphen-agnostic)
    name_clean = name.lower().replace("-", " ").replace(".", "").strip()
    
    for target in ARTISTS:
        target_clean = target.lower().replace("-", " ").replace(".", "").strip()
        # Direct match or containment
        if target_clean == name_clean or target_clean in name_clean or name_clean in target_clean:
            return target
    return name

def main():
    if not os.path.exists(MASTER_FILE):
        print(f"Error: {MASTER_FILE} not found.")
        return

    with open(MASTER_FILE, "r") as f:
        songs = json.load(f)

    fixed_count = 0
    for song in songs:
        original = song.get("artist", "")
        normalized = normalize_artist(original)
        if normalized != original:
            song["artist"] = normalized
            fixed_count += 1

    with open(MASTER_FILE, "w") as f:
        json.dump(songs, f, indent=2)

    print(f"Successfully normalized artist names for {fixed_count} songs.")

if __name__ == "__main__":
    main()
