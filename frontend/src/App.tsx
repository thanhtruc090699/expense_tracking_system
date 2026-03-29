import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
//import './App.css'

import '@patternfly/react-core/dist/styles/base.css';
import { Button, Flex } from '@patternfly/react-core';
import { Card, CardTitle, CardBody, CardFooter } from '@patternfly/react-core';
import { Gallery, GalleryItem } from '@patternfly/react-core';

function App() {
  const [count, setCount] = useState(0)

  return (
    <>

    	<Gallery
    	hasGutter
    	>
    	<GalleryItem>
    		<Card ouiaId="BasicCard">
    			<CardTitle>Example Entry</CardTitle>
    			<CardBody>Body</CardBody>
    			<CardFooter>
    		    	<Flex columnGap={{ default: 'columnGapSm' }}>
    		    	<Button variant="primary" size="sm">
    		    	Primary
    		    	</Button>
    		    	<Button variant="secondary" size="sm">
    		    	Secondary
    		    	</Button>
    		    	<Button variant="tertiary" size="sm">
    		    	Tertiary
    		    	</Button>
    		    	<Button variant="danger" size="sm">
    		    	Danger
    		    	</Button>
    		    	<Button variant="warning" size="sm">
    		    	Warning
    		    	</Button>
    		    	</Flex>
    		    </CardFooter>
    		</Card>
       	</GalleryItem>
       	<GalleryItem>
    		<Card ouiaId="SecondaryCard" variant="secondary">
    			<CardTitle>Secondary Card</CardTitle>
    			<CardBody>Body</CardBody>
    			<CardFooter>
    		    	<Flex columnGap={{ default: 'columnGapSm' }}>
    		    	<Button variant="primary" size="sm">
    		    	Primary
    		    	</Button>
    		    	<Button variant="secondary" size="sm">
    		    	Secondary
    		    	</Button>
    		    	<Button variant="tertiary" size="sm">
    		    	Tertiary
    		    	</Button>
    		    	<Button variant="danger" size="sm">
    		    	Danger
    		    	</Button>
    		    	<Button variant="warning" size="sm">
    		    	Warning
    		    	</Button>
    		    	</Flex>
    		    </CardFooter>
    		</Card>
       	</GalleryItem>
    </Gallery>


    </>
  )
}

export default App
