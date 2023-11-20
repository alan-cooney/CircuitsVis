import { Rank, tensor, Tensor1D, Tensor3D } from "@tensorflow/tfjs";
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-grid-system";
import { SampleItems } from "../shared/SampleItems";
import { RangeSelector } from "../shared/RangeSelector";
import { NumberSelector } from "../shared/NumberSelector";
import { minMaxInNestedArray } from "../utils/arrayOps";

/**
 * Get the selected activations
 *
 * @param activations All activations [ tokens x layers x neurons ]
 * @param layerNumber
 * @param neuronNumber
 */
export function getSelectedActivations(
  activations: Tensor3D,
  layerNumber: number,
  neuronNumber: number
): number[] {
  const relevantActivations = activations
    .slice([0, layerNumber, neuronNumber], [-1, 1, 1])
    .squeeze<Tensor1D>([1, 2]);
  return relevantActivations.arraySync();
}

/**
 * Show activations (colored by intensity) for each token.
 *
 * Includes drop-downs for e.g. showing the activations for the selected layer
 * and neuron for the given samples.
 */
export function TextNeuronActivations({
  tokens,
  activations,
  firstDimensionName = "Layer",
  secondDimensionName = "Neuron",
  firstDimensionLabels,
  secondDimensionLabels,
  firstDimensionDefault = 0,
  secondDimensionDefault = 0,
  showSelectors = true
}: TextNeuronActivationsProps) {
  // If there is only one sample (i.e. if tokens is an array of strings), cast tokens and activations to an array with
  // a single element
  const tokensList: string[][] =
    typeof tokens[0] === "string"
      ? ([tokens] as string[][])
      : (tokens as string[][]);
  const activationsList: number[][][][] =
    typeof activations[0][0][0] === "number"
      ? ([activations] as number[][][][])
      : (activations as number[][][][]);

  // Obtain min and max activations for a consistent color scale across all samples
  const [minValue, maxValue] = minMaxInNestedArray(activationsList);

  // Convert the activations to a tensor
  const activationsTensors = activationsList.map((sampleActivations) => {
    return tensor<Rank.R3>(sampleActivations);
  });

  // Get number of layers/neurons
  const numberOfLayers = activationsTensors[0].shape[1];
  const numberOfNeurons = activationsTensors[0].shape[2];
  const numberOfSamples = activationsTensors.length;

  const [samplesPerPage, setSamplesPerPage] = useState<number>(
    Math.min(5, numberOfSamples)
  );
  const [sampleNumbers, setSampleNumbers] = useState<number[]>([
    ...Array(samplesPerPage).keys()
  ]);
  const [layerNumber, setLayerNumber] = useState<number>(firstDimensionDefault);
  const [neuronNumber, setNeuronNumber] = useState<number>(
    secondDimensionDefault
  );

  useEffect(() => {
    // When the user changes the samplesPerPage, update the sampleNumbers
    setSampleNumbers([...Array(samplesPerPage).keys()]);
  }, [samplesPerPage]);

  // Get the relevant activations for the selected samples, layer, and neuron.
  const selectedActivations: number[][] = sampleNumbers.map((sampleNumber) => {
    return getSelectedActivations(
      activationsTensors[sampleNumber],
      layerNumber,
      neuronNumber
    );
  });

  const selectedTokens: string[][] = sampleNumbers.map((sampleNumber) => {
    return tokensList[sampleNumber];
  });

  const selectRowStyle = {
    paddingTop: 5,
    paddingBottom: 5
  };

  return (
    <Container fluid>
      {showSelectors && (
        <Row>
          <Col>
            <Row style={selectRowStyle}>
              <Col>
                <label htmlFor="layer-selector" style={{ marginRight: 15 }}>
                  {firstDimensionName}:
                </label>
                <NumberSelector
                  id="layer-selector"
                  largestNumber={numberOfLayers! - 1}
                  currentValue={layerNumber}
                  setCurrentValue={setLayerNumber}
                  labels={firstDimensionLabels}
                />
              </Col>
            </Row>
            <Row style={selectRowStyle}>
              <Col>
                <label htmlFor="neuron-selector" style={{ marginRight: 15 }}>
                  {secondDimensionName}:
                </label>
                <NumberSelector
                  id="neuron-selector"
                  largestNumber={numberOfNeurons! - 1}
                  currentValue={neuronNumber}
                  setCurrentValue={setNeuronNumber}
                  labels={secondDimensionLabels}
                />
              </Col>
            </Row>
            {/* Only show the sample selector if there is more than one sample */}
            {numberOfSamples > 1 && (
              <Row style={selectRowStyle}>
                <Col>
                  <label htmlFor="sample-selector" style={{ marginRight: 15 }}>
                    Samples:
                  </label>
                  <RangeSelector
                    id="sample-selector"
                    largestNumber={numberOfSamples - 1}
                    currentRangeArr={sampleNumbers}
                    setCurrentValue={setSampleNumbers}
                    numValsInRange={samplesPerPage}
                  />
                </Col>
              </Row>
            )}
          </Col>
          <Col>
            {/* Only show the sample per page selector if there is more than one sample */}
            {numberOfSamples > 1 && (
              <Row style={selectRowStyle}>
                <Col>
                  <label
                    htmlFor="samples-per-page-selector"
                    style={{ marginRight: 15 }}
                  >
                    Samples per page:
                  </label>
                  <NumberSelector
                    id="samples-per-page-selector"
                    smallestNumber={1}
                    largestNumber={numberOfSamples}
                    currentValue={samplesPerPage}
                    setCurrentValue={setSamplesPerPage}
                  />
                </Col>
              </Row>
            )}
          </Col>
        </Row>
      )}
      <Row>
        <Col>
          <SampleItems
            activationsList={selectedActivations}
            tokensList={selectedTokens}
            minValue={minValue}
            maxValue={maxValue}
          />
        </Col>
      </Row>
    </Container>
  );
}

export interface TextNeuronActivationsProps {
  /**
   * List of lists of tokens (if multiple samples) or a list of tokens (if
   * single sample)
   *
   * If multiple samples, each list must be the same length as the number of activations in the
   * corresponding activations list.
   */
  tokens: string[][] | string[];

  /**
   * Activations
   *
   * If multiple samples, will be a nested list of numbers, of the form [ sample x tokens x layers x neurons
   * ]. If a single sample, will be a list of numbers of the form [ tokens x layers x neurons ].
   */
  activations: number[][][][] | number[][][];

  /**
   * Name of the first dimension
   */
  firstDimensionName?: string;

  /**
   * Name of the second dimension
   */
  secondDimensionName?: string;

  /**
   * Labels for the first dimension
   */
  firstDimensionLabels?: string[];

  /**
   * Labels for the second dimension
   */
  secondDimensionLabels?: string[];

  /**
   * Default index for the first dimension
   */
  firstDimensionDefault?: number;

  /**
   * Default index for the second dimension
   */
  secondDimensionDefault?: number;

  /**
   * Whether to show the selector dropdowns
   */
  showSelectors?: boolean;
}
