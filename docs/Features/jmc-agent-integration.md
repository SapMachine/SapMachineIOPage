---
title: JMC Agent Integration
sidebar_position: 3.5
slug: /jmc-agent-integration
---

{/* Copyright (c) 2026 SAP SE or an SAP affiliate company and SapMachine contributors. Licensed under CC BY 4.0. */}

# JMC agent integration

SapMachine includes a version of the [JMC agent](https://github.com/openjdk/jmc/tree/master/agent), which allows to trace specific method calls via user-defined JFR events. In addition to the features supplied by the original JMC agent, additional functionality is included.

## Basic usage

To start the VM with a specific JMC agent XML configuration the `-jmcagent` option is used:

~~~sh
java -jmcagent:<xml-file>
~~~

This enables the trace, but since JFR events are not written by default, no output will be generated. You can enable the trace later with the Java Mission Control application, which can be downloaded from [sapmachine.io](https://sapmachine.io). Or you can start it directly via the `-XX:StartFlightRecording` VM flag:

~~~sh
java -jmcagent:<xml-file> -XX:StartFlightRecording=filename=<jfr-file>
~~~

This starts the trace and writes the JFR events to the specified `<jfr-file>`. The file can later be inspected with Java Mission Control, which provides a graphical event browser. Alternatively the `jfr` program shipped with SapMachine can display the events in text form.

## JMC agent configuration file basics

The methods calls to trace and what to trace for these calls (e.g. method parameters or return value) is specified via an XML file. The basic outline of the xml file is as follows:

~~~xml
<?xml version="1.0" encoding="UTF-8"?>
<jfragent>
  <config>
    <classprefix>__JFREvent</classprefix>
    <allowtostring>true</allowtostring>
    <allowconverter>true</allowconverter>
  </config>
  <events>
    <event id="jdk.log.localeChanged">
      <label>localeChanged</label>
      <description>Tracks changes of the default locale</description>
      <class>java.util.Locale</class>
      <stacktrace>true</stacktrace>
      <rethrow>false</rethrow>
      <path>jdk/log/locale/changed</path>
      <method>
        <name>setDefault</name>
        <descriptor>(Ljava/util/Locale$Category;Ljava/util/Locale;)V</descriptor>
        <!-- What to trace follows here -->
      </method>
      <!-- Here we define the fields to trace -->
    </event>
  </events>
</jfragent>
~~~

### Configuration entry

The `<config>`section contains 3 entries, which usually can be kept as is.

The `<classprefix>`
specifies the prefix of the event class generated for each event. It's unlikely to clash with already present class name, so leave it as is.

The `<allowtostring>`entry determines if the agent is allowed to call `toString()`if it is tracing an object which can be traced by default (`java.lang.String`, `java.lang.Class` and `java.lang.Thread`).

The `<allowconverter>`entry determines if converters are allowed. A converter is a static method which takes one argument and returns a traceable object type. If for example you trace a method parameter which is an array (which cannot be traced). you could specify `java.util.Arrays.toString`as a converter, which converts the array to a string, which can be traced.

### Events entry

After the configuration we specify one or more events to create via the `<event>`entries in the `<events>`section.  Each event traces a specific method call and can trace a number of values of that method call:

* parameters of the called method
* the return value
* instance and static fields of the methods class (this includes the `this`field)

The `<event>`needs an `id`attribute, to specify the JFR id to create for this event. Duplicated ids are not allowed.

The `<label>`entry specifies the human readable name of the event and the `<description>`contains a longer description. Note that the description should **not be empty**, since it trips up the agent.

The `<path>`entry specifies the path in the event browser of JMC. Think of it as a normal file path.

The `<stacktrace>`entry lets you choose if a stacktrace should be taken and attached to the JFR event. While it is often very helpful or even needed, you should be aware of the additional space needed in the jfr file.

The `<class>`entry specifies the name of the class of the method to be traced.

### Method entry

And the final entry is the `<method>`entry, which specifies the method to be traced and what values should be traced for the method.

The `<name>`entry specifies the name of the method to be trace. If you want to trace a constructor, just use the simple class name here (this only works in the SAP version of the JMC agent).

The `<descriptor>`entry specifies the signature of the method. Unfortunately,  the signature has to be specified as a [method descriptor]( https://docs.oracle.com/javase/specs/jvms/se24/html/jvms-4.html#jvms-4.3.3) instead of the usual Java notation. To create this descriptor you first have to convert the Java types to [field descriptors](https://docs.oracle.com/javase/specs/jvms/se24/html/jvms-4.html#jvms-4.3.2). This is done the following way:

* The basic types are converted to single characters (all must be upper case):
  * **boolean** to **Z**
  * **byte** to **B**
  * **char** to **C**
  * **int** to **I**
  * **long** to **J**
  * **float** to **F**
  * **double** to **D**
  * **void** to **V** (only used for the return type)
* Non-array classes are converted by replacing all **.** in the full class name by **/**, prefixing the result with **L** and adding **;** as a suffix. For example:
  * **java.lang.Class** is converted to **Ljava/lang/Class;**
  * A class **Z** in the default package would be converted to **LZ;** (so it cannot be mistaken for a converted **boolean** type)
* An array type is converted by prepending **[** for each dimension of the array. For example:
  * **int[]** is converted to **[I**
  * **boolean[][][]** is converted to **[[[Z**
  * **String[]** is converted to **[Ljava/lang/String;**

The method descriptor is now created by concatenating **(**, the field descriptors of the parameter types in order, **)** and the return type as a field descriptor. For example:

* the method **void main(String[])** will have the signature **([Ljava/lang/String;)V**
* the method **String toString()** will have the signature **()Ljava/lang/String;**

After this, the entries for method parameters, return value or fields follow. Note that each entry is optional.

### Parameters entry

If you want to trace one or more of the method arguments, add a `<parameters>`entry. Here is an example:

~~~xml
<parameters>
  <parameter index="0">
    <name>parm1</name>
    <description>Should not be empty!</description>
  </parameter>
  <parameter index="1">
    <name>param2</name>
    <description>Should not be empty!</description>
    <converter>java.util.Arrays.toString()V</converter>
  </parameter>
</parameters>
~~~

The `<parameters>`entries contains one or more `<parameter>`entry. Note that you can trace a parameter multiple times. This might seem useless, but it can useful in certain cases where you use different converters to transform the traced object.

The `<parameter>`entry has an `index`attribute, which specifies the parameter to trace. `0`is the first parameter, `1`the second and so on.

 The `<name>`entry specifies the attribute name of the JFR event. This should be unique for the event.

The `<description>`is a human readable description and again **should not be empty**.

The `<converter>`entry is optional. See the [Converter](#converters) section for more details.

### Return value entry

Here is an example of a `<returnvalue>`entry. which traces the return value of the method call.

~~~xml
<returnvalue>
    <name>returnvalue</name>
    <description>Should not be empty!</description>
    <converter>java.lang.String.valueOf()V</converter>
</returnvalue>
~~~

The `<returnvalue>`entry needs no attribute. Otherwise the nested entries are the same as for the `<parameter>`entry. Note that even though it could be useful (when different converters could be used), only one entry is allowed per event.

### Fields entry

The `<fields>`entry contains the fields to be traced. Note that it doesn't belongs inside the `<method>`entry, but inside the `<event>`entry. Here is an example.

~~~xml
<fields>
  <field>
    <name>this</name>
    <description>Must not be empty</description>
    <expression>this</expression>
  </field>
  <field>
    <name>StaticField</name>
    <description>Must not be empty</description>
    <expression>a_static_field</expression>
  </field>
</fields>
~~~

The field to be traced is not specified by an attribute to the `<field>`entry, but with the `<expression>`entry.  As with the `<parameter>`entry you can trace a field multiple times, which can be useful when using converters.

Given the following class:

~~~java
public class Base {
    String s1 = "baseInstance";
}

public class Test extends Base {
    String s1 = "instance";
    static String s2 = "static";

    class Inner {
        private String inner = "inner";
        // Method omitted.
    }

    static class InnerStatic {
        public static String inner = "staticInner";
    }
}

~~~

* If you trace a method in `Test`you can access the instance field s1 by using the expression `s1`or `this.s1`. If you want to trace the static field s2 you can use the expression `s2` or `Test.s2`
* You can trace any unrelated static field which is accessible from the trace method by using `full.class.Name.fieldName`. For example you could use `java.io.File.pathSeparator`to trace static the `pathSeparator`field.
* If you trace an instance method in `Inner`you can trace the instance field s1 of the outer class by using `Test.this.s1`. This only works if the field is not private.
* If you trace a method in `Test`, you can trace the static field `inner`with the expression `InnerStatic.inner`.
* You don't have to specify a package name for classes in `java.lang`.

### Converters

The JMC agent can only trace specific types. All primitive types are supported and in addition `String`, `Class`and `Thread`. When the agent encounters another type it can call the `toString()`method on the object and use this as the traced value (if allowed in the `<config>`section).

If this is not what you want, a converter can be used. A converter can be specified in the `<parameter>`, `<returnvalue>` and `<field>`entries. A converter specifies a static, one-argument method to be called with the value to be traced. Then the returned value of the converter method instead is traced.

The converter can be specified in two ways:

 1. By using a fully qualified class name. The agent will then call a static method called `convert()`of that class.
 2. By specifying a static method to be called. While the agent wants to have the method specified including the method descriptor, it will call the first method with the given name it can find and which is compatible with the declared type of the traced value. This means it is always OK to just use `()V`as the method descriptor.

Given the following class:

~~~java
public class Converter {
    static String convert(int i) { return "" + i; }
    static float convertToFloat(int i) { return (float) i; }
    static String overloadedMethod(Object o) { return o.toString(); }
    static int overloadedMethod(Integer i) { return i; }
 }
~~~

The converter `<converter>Converter</converter>`will convert an `int`value by calling the `convert()`method of the class and convert the integer to a string.

The converter `<converter>Converter.overloadedMethod()V</converter>`will convert a type which is not `Integer` to a String by calling the `overloadedMethod(Object)`method. If the declared type is `Integer`, both overloaded method would be suitable. Currently the JMC agent will call the first method which is compatible with the declared type of the traced value.
