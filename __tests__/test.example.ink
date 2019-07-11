VAR testValue = 999
VAR otherTestValue = 123

Intro paragraph 1
Intro paragraph 2 # p2: tag for paragraph 2
Intro paragraph 3 # p3: { "key1": 1, "key2": "alpha" }

+ [Choice]
    Selected choice
+ [Command]
    >>> TESTCOMMAND arg1 arg2
    testcommand
+ [testValues]
    testValue={testValue}
    otherTestValue={otherTestValue}
+ [testValue+1000]
    ~ testValue = testValue + 1000
    testValue={testValue}
+ [changeValue_function]
    ~ decreaseTestValue(99)
    testValue={testValue}
-
+ [End script]
# scene: final
# customtag
End
-> END

=== function decreaseTestValue(x) ===
    { testValue < x:
    	~ testValue = 0
    - else:
    	~ testValue = testValue - x
    }

=== function testEvaluation(x, y) ===
   This is function output.
   Test values are {x} {y}
   ~ temp output = "" 
   ~ output = "testValue = {x} - {y}"
   ~ return output