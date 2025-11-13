# Overview

Provides interactive visualization tools for exploring gene expression patterns in bulk RNA sequencing data. The block takes count matrices from RNA-seq preprocessing blocks (e.g., STAR read mapping) as input and enables visualization of gene expression values across samples and experimental conditions.

The block offers two complementary visualization types: box plots for comparing gene expression distributions across samples or conditions for individual genes, and expression heatmaps for examining gene expression patterns across multiple genes and samples simultaneously. The heatmap visualization can optionally filter genes based on differential expression results from upstream analysis blocks, enabling focused examination of genes that are significantly different between conditions.

The block integrates seamlessly with upstream bulk RNA-seq analysis blocks, automatically linking count matrices with their associated sample metadata and differential expression data for comprehensive gene-level exploration and publication-ready visualizations.
