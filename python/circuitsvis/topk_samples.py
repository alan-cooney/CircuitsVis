"""Activations visualizations"""
import torch
from typing import List, Optional, Union

from circuitsvis.utils.render import RenderedHTML, render


def topk_samples(
    tokens: List[List[List[List[str]]]],
    activations: Union[List[List[List[List[float]]]], torch.Tensor],
    zeroth_dimension_name: Optional[str] = "Layer",
    first_dimension_name: Optional[str] = "Neuron",
    zeroth_dimension_labels: Optional[List[str]] = None,
    first_dimension_labels: Optional[List[str]] = None,
) -> RenderedHTML:
    """List of samples in descending order of max token activation value for the
    selected layer and neuron (or whatever other dimension names are specified).

    Args:
        tokens: List of tokens of shape [layers x neurons x samples x tokens]
        activations: Activations of shape [layers x neurons x samples x tokens]
        zeroth_dimension_name: Zeroth dimension to display (e.g. "Layer")
        first_dimension_name: First dimension to display (e.g. "Neuron")

    Returns:
        Html: TopkSamples visualization
    """
    return render(
        "TopkSamples",
        tokens=tokens,
        activations=activations,
        zerothDimensionName=zeroth_dimension_name,
        firstDimensionName=first_dimension_name,
        zerothDimensionLabels=zeroth_dimension_labels,
        firstDimensionLabels=first_dimension_labels,
    )
