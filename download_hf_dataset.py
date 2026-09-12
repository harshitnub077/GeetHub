from datasets import load_dataset
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def main():
    logging.info("Starting download of 'jammai/chords_and_lyrics' dataset from Hugging Face...")
    try:
        dataset = load_dataset("jammai/chords_and_lyrics")
        logging.info("Dataset loaded. Inspecting structure...")
        logging.info(f"Available splits: {dataset.keys()}")
        
        if 'train' in dataset:
            df = dataset['train'].to_pandas()
        else:
            split_name = list(dataset.keys())[0]
            df = dataset[split_name].to_pandas()
            
        logging.info(f"Loaded {len(df)} songs.")
        
        output_file = "hf_chords_dataset.jsonl"
        logging.info(f"Saving to {output_file} in JSONL format...")
        df.to_json(output_file, orient='records', lines=True)
        
        logging.info("Finished successfully!")
    except Exception as e:
        logging.error(f"Failed to download dataset: {e}")

if __name__ == "__main__":
    main()
