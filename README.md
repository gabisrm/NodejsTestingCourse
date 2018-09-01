NOTAS

En nodejs, el framework más popular de testing es Mocha.


MOCHA:

BLOQUES QUE ENGLOBAN TESTS:
    bloque 'describe' => engloba al módulo/archivo
    bloque 'context' => engloba a la función que se va a testear. En teoría ambos (describe/context) hacen lo mismo, pero por convenio se usan así.
    bloque 'it' => define un test en la función definida por el context

BLOQUES QUE ENGLOBAN ACCIONES ANTES/DESPUES DE TEST:



Pending tests:
    - se generan con un bloque 'it' sin el segundo arghumento de entrada. Es como definir antes los test, si la función no está hecha (o terminada), y dejar un test pendiente. metodología TDD


ASSERT