import { useState } from 'react'

import { EasyOcr } from '../components/EasyOcr'

//import { Button, Flex } from '@patternfly/react-core';
//import { Gallery, GalleryItem } from '@patternfly/react-core';

import '@patternfly/react-core/dist/styles/base.css';
import { Bullseye } from '@patternfly/react-core';
import { Card, CardTitle, CardBody, CardFooter } from '@patternfly/react-core';

import {
  Masthead,
  MastheadMain,
  MastheadToggle,
  MastheadBrand,
  MastheadLogo,
  MastheadContent,
  Button,
  Flex,
  FlexItem
} from '@patternfly/react-core';


export function EasyOcrPage() {
	return(
	<>
	<Masthead id="basic-mixed">
	<MastheadMain>
	<MastheadToggle>
	<Button variant="plain" isHamburger onClick={() => {}} aria-label="Global navigation" />
	</MastheadToggle>
	<MastheadBrand>
	<MastheadLogo component="a">Logo</MastheadLogo>
	</MastheadBrand>
	</MastheadMain>
	<MastheadContent>
	<Flex>
	    <Button>EasyOcr</Button>
	    <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
	    <Button variant="secondary">OcrSpace</Button>
	    </FlexItem>
	    <FlexItem alignSelf={{ default: 'alignSelfFlexEnd' }}>
	    <Button variant="tertiary">Lisa</Button>
	    </FlexItem>
	</Flex>
	</MastheadContent>
	</Masthead>

	<Bullseye>
	<div
	style={{
		padding: '25px' // Bullseye isn't centered vertically for some reason.
	}}
	>
	<EasyOcr />
	</div>
	</Bullseye>
	</>
	)
}
