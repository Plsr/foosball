# Research: a simple Bundesliga score simulation

## Decision

For version one, model a match between two anonymous teams as two independent goal counts:

```text
Team A goals ~ Poisson(1.58)
Team B goals ~ Poisson(1.58)
```

Each draw is already a non-negative integer. Compare the two values and report the score plus the result (Team A win, draw, or Team B win). This is intentionally a league-average baseline: there are no team identities, player effects, form, strength ratings, home advantage, match events, or in-game state.

The per-team mean is half of the observed six-season league mean:

```text
5,787 goals / 1,836 matches = 3.1520 total goals per match
3.1520 / 2 = 1.5760 goals per team
```

Use `1.58` as the human-readable parameter, or retain `1.5760` internally.

## What “the last few years” means here

As of September 2026, “last few years” is interpreted as the six latest completed Bundesliga seasons: 2020/21 through 2025/26. Each season had 18 teams, 34 matchdays, and 306 league matches. Relegation playoff matches are excluded.

## Observed scoring level

| Season | League matches | Total goals | Goals per match |
| --- | ---: | ---: | ---: |
| 2020/21 | 306 | 928 | 3.03 |
| 2021/22 | 306 | 954 | 3.12 |
| 2022/23 | 306 | 971 | 3.17 |
| 2023/24 | 306 | 985 | 3.22 |
| 2024/25 | 306 | 959 | 3.13 |
| 2025/26 | 306 | 990 | 3.24 |
| **Total / weighted mean** | **1,836** | **5,787** | **3.15** |

The totals for 2020/21–2024/25 are reported by the DFB Datencenter as 928, 954, 971, 985, and 959 goals in 306 matches respectively. The 2025/26 official season summary reports 990 goals; the DFB final table is a cross-check because its 18 club totals also sum to 990. Sources: [DFB 2020/21](https://datencenter.dfb.de/datencenter/ranglisten/bundesliga/2020-21), [DFB 2021/22](https://datencenter.dfb.de/ranglisten/bundesliga/2021-22), [DFB 2022/23](https://datencenter.dfb.de/ranglisten/bundesliga/2022-23), [DFB 2023/24](https://datencenter.dfb.de/ranglisten/bundesliga/2023-24), [DFB 2024/25](https://datencenter.dfb.de/ranglisten/bundesliga/2024-25), [official 2025/26 season statistics](https://www.bundesliga.com/en/bundesliga/news/2025-26-season-in-numbers-37374), and [DFB 2025/26 final table](https://datencenter.dfb.de/datencenter/bundesliga/2025-2026/34).

The weighted mean is preferable to averaging the six rounded season averages. It gives every match the same weight and preserves the observed total-goal rate.

## Why Poisson is a reasonable first model

The simulation needs a non-negative integer number of goals, and the league data provides an average rate rather than a causal match model. A Poisson distribution is the smallest useful model for that situation:

- it produces `0, 1, 2, ...` goals;
- its single parameter is directly interpretable as average goals;
- independently sampled team goals add to a total with the desired mean;
- it is easy to replace later without changing the rest of the simulation’s interface.

This is a modeling choice and an inference from the observed scoring rate, not a claim that real football goals are perfectly Poisson-distributed.

## Expected shape of the result

With a total-goal rate of `λ = 3.1520`, the corresponding Poisson baseline predicts approximately:

| Total goals | Probability |
| ---: | ---: |
| 0 | 4.3% |
| 1 | 13.5% |
| 2 | 21.2% |
| 3 | 22.3% |
| 4 | 17.6% |
| 5 | 11.1% |
| 6 or more | 10.0% |

So the most common single total is three goals, while zero- and one-goal games remain possible. The model’s average is 3.15 goals, not a promise that every generated match will contain three goals.

## Recommended generation procedure

1. Draw a random integer for Team A from a Poisson distribution with mean `1.5760`.
2. Draw a separate random integer for Team B from the same distribution.
3. Format the score as `A:B`.
4. Compare the values to label the outcome.

Examples of valid outcomes include `0:0` (draw), `2:1` (Team A win), and `1:3` (Team B win). The teams are symmetric; swapping their labels should swap the outcome with no change in probability.

## Deliberate exclusions

Do not add these in version one:

- team strength or club-specific scoring rates;
- player selection, injuries, lineups, or player statistics;
- home/away advantage;
- possession, shots, attacks, cards, substitutions, or goal timing;
- a minute-by-minute match simulation;
- hand-tuned caps such as “no more than five goals.”

Artificial caps would distort the high-scoring tail. If unusually high scores are a concern later, validate the random generator and inspect the historical distribution before changing the model.

## Validation criteria for a future implementation

Run a large batch of generated matches and check that:

- mean total goals is close to `3.15`;
- Team A and Team B means are each close to `1.58`;
- both teams have nearly identical distributions;
- the total-goal frequencies broadly follow the table above;
- the output always contains two non-negative integers and exactly one outcome label.

The first version should be judged on reproducing the league-level scoring climate, not on predicting real fixtures. Predictive behavior would require team-specific historical data and a materially richer model.

## Open questions for the next iteration

- Should a match have a designated home team, allowing a small home-advantage adjustment?
- Should the two teams eventually receive different attack and defense strengths?
- Should the calibration window remain six seasons or use a recency-weighted average?
- Does the product need realistic score distributions beyond the mean, requiring validation against match-level frequencies rather than season totals alone?
