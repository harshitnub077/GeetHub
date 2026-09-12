from datasets import load_dataset
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    logging.info("Starting download of Ultimate Guitar dataset (Chordonomicon) from Hugging Face...")
    # Load the dataset
    dataset = load_dataset("ailsntua/Chordonomicon")
    
    logging.info("Dataset loaded. Inspecting structure...")
    logging.info(f"Available splits: {dataset.keys()}")
    
    # Usually it's in the 'train' split
    if 'train' in dataset:
        df = dataset['train'].to_pandas()
    else:
        # Fallback to the first available split
        split_name = list(dataset.keys())[0]
        df = dataset[split_name].to_pandas()
        
    logging.info(f"Loaded {len(df)} songs.")
    
    # Save to jsonl format
    output_file = "ultimate_guitar_songs.jsonl"
    logging.info(f"Saving to {output_file} in JSONL format...")
    df.to_json(output_file, orient='records', lines=True)
    
    logging.info("Finished successfully!")

if __name__ == "__main__":
    main()
