# Bees with Frickin' Laser Beams!

An experiment in using AWS Lambda to load test web applications.

See the full explanation on [our blog](http://log.roadtrippers.com/lambda-bees-with-frickin-laser-beams.html).

## Installation

```
npm install
```

## Usage

The script requires the following params:

`-n` - Total request count

`-c` - Concurrent request count

`-u` - Target url

```
node bees.js -n 2000 -c 100 -u https://SomeServerYouAreAllowedToCrash.com/
```

## Bugs

Please log any bugs you experience in our [issue tracker](https://github.com/roadtrippers/beeswithfrickinlaserbeams/issues).

## Shout outs

This project was heavily inspired by the wonderful [Bees with Machine Guns!](https://github.com/newsapps/beeswithmachineguns).

## License

MIT