# Satellite Operator Flow Review

## Round 1
Operator concern: Demo setup controls were mixed into the mission execution flow.

Decision: Keep fleet sandbox and map display as setup cards, but separate them from the mission flow in navigation.

## Round 2
Operator concern: A real tasking flow cannot evaluate satellites before the target is geolocated.

Decision: Mission flow must be intake -> target gate -> requirements -> AOI/access -> fleet readiness.

## Round 3
Operator concern: Approval should happen after candidate decision and before command packet visibility.

Decision: Keep the command packet locked until operator approval, then auto-advance to the command packet.

## Round 4
Operator concern: The left flow showed only coarse phases and could contradict the current card.

Decision: Left flow now lists every card and uses one clear current-card highlight.

## Round 5
Operator concern: The demo should not require extra navigation after output-producing actions.

Decision: Analyze, target resolve, AOI draw, approve, and export actions now advance to the relevant result card automatically.

