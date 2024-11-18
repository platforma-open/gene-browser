#!/usr/bin/env Rscript

# Usage
# Rscript process_RNASeq.R path/to/raw_counts.csv path/to/output_folder

# Load necessary libraries
library(DESeq2)
library(reshape2)

# Processing function
process_RNASeq <- function(raw_counts_path, output_folder) {
  
  # Read raw counts
  countsDataLong <- read.csv(raw_counts_path)

  sample_col <- names(countsDataLong)[1]
  gene_col <- names(countsDataLong)[2]
  count_col <- names(countsDataLong)[3]

  # Reshape to classic count matrix format (sample as col, gene as row)
  countsDataWide <- dcast(countsDataLong, formula = paste(gene_col, "~", sample_col), value.var = count_col)
  rownames(countsDataWide) <- countsDataWide[[gene_col]]
  countsDataWide[[gene_col]] <- NULL
  
  # Create a minimal colData with no specific sample information
  colData <- data.frame(row.names = colnames(countsDataWide))
  dds <- DESeqDataSetFromMatrix(countData = countsDataWide, colData = DataFrame(condition = rep("none", ncol(countsDataWide))), design = ~ 1)
  dds <- DESeq(dds)
  
  # Extract normalized counts
  normalized_counts <- counts(dds, normalized = TRUE)

  # Convert to long format for output
  normalized_counts_long <- melt(as.data.frame(normalized_counts), variable.name = "Sample", value.name = "NormCounts")
  normalized_counts_long$Geneid <- rownames(normalized_counts)[as.numeric(normalized_counts_long$Var1)]
  normalized_counts_long <- normalized_counts_long[, c("Sample", "Geneid", "NormCounts")]
  
  # Write normalized counts to CSV
  normalized_counts_path <- file.path(output_folder, "normalized_counts.csv")
  write.csv(normalized_counts_long, file = normalized_counts_path, row.names = TRUE)

  # # Log-transform the normalized counts
  # log_normalized_counts <- log2(normalized_counts + 1)

  # # Write log-transformed normalized counts to CSV
  # log_normalized_counts_path <- file.path(output_folder, "log_normalized_counts.csv")
  # write.csv(log_normalized_counts, file = log_normalized_counts_path, row.names = TRUE)
  
  cat("Normalized counts have been saved to:", normalized_counts_path, "\n")
  #cat("Log transformed normalized counts have been saved to:", log_normalized_counts_path, "\n")
}

# Main execution block
args <- commandArgs(trailingOnly = TRUE)

# Check for correct number of arguments
if (length(args) != 2) {
  cat("Usage: Rscript normalize_counts.R <raw_counts_path> <output_folder>\n")
  quit(status = 1)
}

# Assign arguments
raw_counts_path <- args[1]
output_folder <- args[2]

# Process RNASeq data
process_RNASeq(raw_counts_path, output_folder)
