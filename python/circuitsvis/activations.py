"""Activations visualizations"""
from typing import List, Union, Optional

import numpy as np
import torch
from circuitsvis.utils.render import RenderedHTML, render


def text_neuron_activations(
    tokens: Union[List[str], List[List[str]]],
    activations: Union[np.ndarray, torch.Tensor, List[np.ndarray], List[torch.Tensor]],
    first_dimension_name: Optional[str] = "Layer",
    second_dimension_name: Optional[str] = "Neuron",
    first_dimension_labels: Optional[List[str]] = None,
    second_dimension_labels: Optional[List[str]] = None,
    first_dimension_default: Optional[int] = 0,
    second_dimension_default: Optional[int] = 0,
    show_selectors: Optional[bool] = True,
) -> RenderedHTML:
    """Show activations (colored by intensity) for each token in a text or set
    of texts.

    Includes drop-downs for layer and neuron numbers.

    Args:
        tokens: List of tokens if single sample (e.g. `["A", "person"]`) or list of lists of tokens (e.g. `[[["A", "person"], ["is", "walking"]]]`)
        activations: Activations of the shape [tokens x layers x neurons] if
        single sample or list of [tokens x layers x neurons] if multiple samples

    Returns:
        Html: Text neuron activations visualization
    """
    # Verify that activations and tokens have the right shape and convert to
    # nested lists
    if isinstance(activations, (np.ndarray, torch.Tensor)):
        assert (
            activations.ndim == 3
        ), "activations must be of shape [tokens x layers x neurons]"
        activations_list = activations.tolist()
    elif isinstance(activations, list):
        activations_list = []
        for act in activations:
            assert (
                act.ndim == 3
            ), "activations must be of shape [tokens x layers x neurons]"
            activations_list.append(act.tolist())
    else:
        raise TypeError(
            f"activations must be of type np.ndarray, torch.Tensor, or list, not {type(activations)}"
        )

    return render(
        "TextNeuronActivations",
        tokens=tokens,
        activations=activations_list,
        firstDimensionName=first_dimension_name,
        secondDimensionName=second_dimension_name,
        firstDimensionLabels=first_dimension_labels,
        secondDimensionLabels=second_dimension_labels,
        firstDimensionDefault=first_dimension_default,
        secondDimensionDefault=second_dimension_default,
        showSelectors=show_selectors,
    )
